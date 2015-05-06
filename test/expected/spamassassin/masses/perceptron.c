/* This program uses stochastic gradient descent to learn a scoreset for
 * SpamAssassin.  You'll need to run logs-to-c from spamassassin/masses to
 * generate the stuff in tmp.
 *
 * <@LICENSE>
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to you under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at:
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * </@LICENSE>
 */

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <sys/time.h>
#include <math.h>
#include <unistd.h>

#include "tmp/scores.h"
#include "tmp/tests.h"

/* Ensure that multiple error functions have not been chosen. */
#ifdef ENTROPIC_ERROR
#ifdef LEAST_SQUARES_ERROR
#warn Both entropic error and least squares error chosen.  Using least squares.
#endif
#endif

/* Choose the least squares error function by default. */
#ifndef ENTROPIC_ERROR
#ifndef LEAST_SQUARES_ERROR
#define LEAST_SQUARES_ERROR
#endif
#endif

#define OUTPUT_FILE "perceptron.scores"
/* #define IGNORE_SCORE_RANGES 1 */

void init_wheel ();
void destroy_wheel ();
int get_random_test ();
void init_weights();
void destroy_weights ();
void write_weights (FILE * fp);
void scale_scores (double old_threshold, double new_threshold);
double evaluate_test (int test);
double evaluate_test_nogain (int test);
void train (int num_epochs, double learning_rate);
void usage ();

/* Converts a weight to a SpamAssassin score. */
#define weight_to_score(x) (-threshold*(x)/bias)
#define score_to_weight(x) (-(x)*bias/threshold)

int wheel_size; /* The number of entries in the roulette wheel (NOT THE
		   SIZE OF THE ROULETTE_WHEEL ARRAY!). */
int * roulette_wheel; /* Used for roulette wheel selection. */
double ham_preference = 2.0;

#define DEFAULT_THRESHOLD 5.0
double threshold = DEFAULT_THRESHOLD;

double * weights; /* The weights of the single-layer perceptron. */
double bias; /* The network bias for the single-layer perceptron. */

int num_epochs = 15;
double learning_rate = 2.0;
double weight_decay = 1.0;

/* Initialize the roulette wheel and populate it, replicating harder-to-classify hams. */
void init_wheel () {
	int i;
	int spam = 0, ham = 0;

	/* cache locations on the roulette wheel for fast lookups */
	roulette_wheel = (int*)calloc(num_nondup, sizeof(int));
	wheel_size = 0;

	roulette_wheel[0] = 0;

	for (i = 0; i < num_nondup - 1; i++) {
		int slot_size = 1;

		/* Hams with more tests are rare and harder to classify but are the
		 * most important to classify correctly.  They are thus replicated in the
		 * training set proportionally to their difficulty. */
		if ( ! is_spam[i] ) {
			slot_size += (int)(num_tests_hit[i] * ham_preference * tests_count[i]);
		} else {
			slot_size = tests_count[i];
		}

		/* The database is compressed with all instances mapped in the same place. */
		wheel_size += slot_size;

		if ( ! is_spam[i] ) {
			ham += slot_size;
		} else {
			spam++;
		}

		roulette_wheel[i+1] = roulette_wheel[i] + slot_size;
	}

	printf ("Modified training set statistics: %d spam, %d ham.\n", spam, ham);
}

/* Free the resources for the roulette wheel selector. */
void destroy_wheel () {
	if ( roulette_wheel ) {
		free (roulette_wheel);
		roulette_wheel = 0;
		wheel_size = 0;
	}
}

/* Get a random test using roulette wheel selection.  This is not used anymore. */
int get_random_test () {
	int r;
	int bottom, middle, top;

	r = lrand48() % wheel_size;

	bottom = 0;
	top = num_nondup - 1;
	middle = top / 2;

	while (1) {
		if ( r < roulette_wheel[bottom+1] ) {
			return bottom;
		} else if ( r >= roulette_wheel[top] ) {
			return top;
		} else if ( r >= roulette_wheel[middle] && r < roulette_wheel[middle+1] ) {
			return middle;
		} else if ( r < roulette_wheel[middle] ) {
			top = middle-1;
			bottom++;
			middle = bottom + (top-bottom)/2;
		} else {
			bottom = middle+1;
			top--;
			middle = bottom + (top-bottom)/2;
		}
	}
}

/* Allocate and initialize the weights over the range [-0.5..0.5] */
void init_weights () {
	int i;

	weights = (double*)calloc(num_scores, sizeof(double));

	bias = drand48() - 0.5;
	for (i = 0; i < num_scores; i++) {
		weights[i] = range_lo[i] + drand48() * (range_hi[i] - range_lo[i]);
	}
}

/* Free the resources allocated for the weights. */
void destroy_weights () {
	if ( weights ) {
		free(weights);
		weights = 0;
	}
}

/* Writes out the weights in SpamAssassin score space. */
void write_weights (FILE * fp) {
	int i;
	int ga_nn, ga_yy, ga_ny, ga_yn;
	double nnscore, yyscore, nyscore, ynscore;

	ga_nn = ga_yy = ga_ny = ga_yn = 0;
	nnscore = yyscore = nyscore = ynscore = 0;

	/* Run through all of the instances in the training set and tally up
	 * the scores. */
	for (i = 0; i < num_nondup; i++) {
		double score = weight_to_score(evaluate_test_nogain(i)) + threshold;

		if ( score >= threshold && is_spam[i] ) {
			ga_yy += tests_count[i];
			yyscore += tests_count[i] * score;
		} else if ( score < threshold && !is_spam[i] ) {
			ga_nn += tests_count[i]; 
			nnscore += tests_count[i] * score;
		} else if ( score >= threshold && !is_spam[i] ) {
			ga_ny += tests_count[i];
			nyscore += tests_count[i] * score;
		} else {
			ga_yn += tests_count[i];
			ynscore += tests_count[i] * score;
		}
	}

	/* This is copied from the dump() function in craig-evolve.c.  It 
	 * outputs some nice statistics about the learned classifier. */
	fprintf (fp,"\n# SUMMARY for threshold %3.1f:\n", threshold);
	fprintf (fp,
			"# Correctly non-spam: %6d  %4.2f%%\n",
			ga_nn,
			(ga_nn / (float) num_ham) * 100.0);
	fprintf (fp,
			"# Correctly spam:     %6d  %4.2f%%\n",
			ga_yy,
			(ga_yy / (float) num_spam) * 100.0);
	fprintf (fp,
			"# False positives:    %6d  %4.2f%%\n",
			ga_ny,
			(ga_ny / (float) num_ham) * 100.0);
	fprintf (fp,
			"# False negatives:    %6d  %4.2f%%\n",
			ga_yn,
			(ga_yn / (float) num_spam) * 100.0);

	fprintf (fp,"# Average score for spam:  %3.3f    ham: %3.1f\n",(ynscore+yyscore)/((double)(ga_yn+ga_yy)),(nyscore+nnscore)/((double)(ga_nn+ga_ny)));
	fprintf (fp,"# Average for false-pos:   %3.3f  false-neg: %3.1f\n",(nyscore/(double)ga_ny),(ynscore/(double)ga_yn));

	fprintf (fp,"# TOTAL:              %6d  %3.2f%%\n\n", num_tests, 100.0);


	for (i = 0; i < num_scores; i++) {
		if ( is_mutable[i] )  {
			fprintf(fp, "score %-30s %2.3f # [%2.3f..%2.3f]\n", score_names[i], weight_to_score(weights[i]), range_lo[i], range_hi[i]);
		} else {
			fprintf(fp, "score %-30s %2.3f # not mutable\n", score_names[i], range_lo[i]);
		}
	}
}

/* This is to support Daniel's threshold thing. */
void scale_scores (double old_threshold, double new_threshold) {
	int i;

	/* No need to scale something to itself. */
	if ( old_threshold == new_threshold ) {
		return;
	}

	for (i = 0; i < num_scores; i++) {
		if ( is_mutable[i] ) {
			range_lo[i] = range_lo[i] * new_threshold / old_threshold;
			range_hi[i] = range_hi[i] * new_threshold / old_threshold;
		}
	}

	/* Maybe we don't want this bit.  This prescaling stuff makes my
	 * brain hurt.*/
	/*
	for (i = 0; i < num_nondup; i++) {
		scores[i] = scores[i] * new_threshold / old_threshold;
	}
	*/
}

/* Computes the value of the activation function of the perceptron for
 * a given input. */
double evaluate_test (int test) {
#ifdef LEAST_SQUARES_ERROR
	return 1/(1+exp(-evaluate_test_nogain(test)));
#else
#ifdef ENTROPIC_ERROR
	return tanh(evaluate_test_nogain(test));
#endif
#endif
}

/* Computes the value of the transfer function (in this case, linear) for
 * an input defined in tests_hit[test]* */
double evaluate_test_nogain (int test) {
	double sum;
	int i;

	sum = bias;

	for (i = 0; i < num_tests_hit[test]; i++) {
		sum += weights[tests_hit[test][i]];
	}

	/* Translate the 'unmutable' scores to weight space. */
	sum += score_to_weight(scores[test]);

	return sum;
}

/* Trains the perceptron using stochastic gradient descent. */
void train (int num_epochs, double learning_rate) {
	int epoch, random_test;
	int i, j;
	int * tests;
	double y_out, error, delta;

	/* Initialize and populate an array containing indices of training
	 * instances.  This is shuffled on every epoch and then iterated
	 * through.  I had originally planned to use roulette wheel selection,
	 * but shuffled selection seems to work better. */
	tests = (int*)calloc(wheel_size, sizeof(int));

	for (i = 0, j = 0; i < num_nondup-1; i++) {
		for (; j < roulette_wheel[i+1]; j++) {
			tests[j] = i;
		}
	}
	for (; j < wheel_size; j++) {
		tests[j] = num_nondup-1;
	}

	for (epoch = 0; epoch < num_epochs; epoch++) {
		/* decay the weights on every epoch to smooth out statistical
		 * anomalies */
		if ( weight_decay != 1.0 ) {
			bias *= weight_decay;
			for (i = 0; i < num_mutable; i++) {
				weights[i] *= weight_decay;
			}
		}

		/* shuffle the training instances */
		for (i = 0; i < wheel_size-1; i++) {
			int tmp;
			int r = lrand48 () % (wheel_size - i);

			tmp = tests[i];
			tests[i] = tests[r+i];
			tests[r+i] = tmp;
		}

		for (j = 0; j < wheel_size; j++) {

			/* select a random test (they have been randomized above) */
			random_test = tests[j];

			/* compute the output of the network */
			y_out = evaluate_test(random_test);
	
/* compute the error gradient for the logsig node with least squares error */
#ifdef LEAST_SQUARES_ERROR
			error = is_spam[random_test] - y_out;
			delta = y_out * (1-y_out) * error / (num_tests_hit[random_test]+1) * learning_rate;
#else
/* compute the error gradient for the tanh node with entropic error */
#ifdef ENTROPIC_ERROR
			error = (2.0*is_spam[random_test]-1) - y_out;
			delta = error / (num_tests_hit[random_test]+1) * learning_rate;
#endif
#endif
	
			/* adjust the weights to descend the steepest part of the error gradient */
			if ( epoch + 1 < num_epochs ) {
				bias += delta;
			}
			for (i = 0; i < num_tests_hit[random_test]; i++) {
				int idx = tests_hit[random_test][i];
				weights[idx] += delta;

#ifdef IGNORE_SCORE_RANGES
				/* Constrain the weights so that nice rules are always <= 0 etc. */
				if ( range_lo[idx] >= 0 && weights[idx] < 0 ) {
					weights[idx] = 0;
				} else if ( range_hi[idx] <= 0 && weights[idx] > 0 ) {
					weights[idx] = 0;
				}
#else
				if ( weights[idx] < score_to_weight(range_lo[idx]) ) {
					weights[idx] = score_to_weight(range_lo[idx]);
				} else if ( weights[idx] > score_to_weight(range_hi[idx]) ) {
					weights[idx] = score_to_weight(range_hi[idx]);
				}
#endif
			}
		}
	}

	free(tests);
}

void usage () {
	printf ("usage: perceptron [args]\n"
			"\n"
			"  -p ham_preference = adds extra ham to training set multiplied by number of\n"
			"                      tests hit (2.0 default)\n"
			"  -e num_epochs = number of epochs to train (15 default)\n"
			"  -l learning_rate = learning rate for gradient descent (2.0 default)\n"
			"  -t threshold = minimum threshold for spam (5.0 default)\n"
			"  -w weight_decay = per-epoch decay of learned weight and bias (1.0 default)\n"
			"  -h = print this help\n"
			"\n");
	exit(30);
}

int main (int argc, char ** argv) {
	struct timeval tv, tv_start, tv_end;
	long long int t_usec;
	FILE * fp;
	int arg;

	/* Read the command line options */
	while ((arg = getopt (argc, argv, "p:e:l:t:w:h?")) != -1) {
		switch (arg) {
			case 'p':
				ham_preference = atof(optarg);
				break;

			case 'e':
				num_epochs = atoi(optarg);
				break;

			case 'l':
				learning_rate = atof(optarg);
				break;

			case 't':
				threshold = atof(optarg);
				break;

			case 'w':
				weight_decay = atof(optarg);
				break;

			case 'h':
			case '?':
				usage();
				break;
		}
	}

	/* Seed the PRNG */
	gettimeofday (&tv, 0);
	t_usec = tv.tv_sec * 1000000 + tv.tv_usec;
	srand48 ((int)t_usec);

	/* Load the instances and score constraints generated by logs-to-c. */
	loadtests();
	loadscores();

	/* If the threshold has been changed, the ranges and scores need to be
	 * scaled so that the output of the program will not be affected.
	 */
	scale_scores (DEFAULT_THRESHOLD, threshold);

	/* Replicate instances from the training set to bias against false positives. */
	init_wheel ();

	/* Allocate and initialize the weight vector. */
	init_weights ();

	/* Train the network using stochastic gradient descent. */
	gettimeofday(&tv_start, 0);
	train(num_epochs, learning_rate);
	gettimeofday(&tv_end, 0);

	t_usec = tv_end.tv_sec * 1000000 + tv_end.tv_usec -
		(tv_start.tv_sec *1000000 + tv_start.tv_usec);
	printf ("Training time = %fs.\n", t_usec / 1000000.0f);

	/* Translate the learned weights to SA score space and output to a file. */
	fp = fopen (OUTPUT_FILE, "w");
	if ( fp ) {
		write_weights(fp);
		fclose(fp);
	} else {
		perror (OUTPUT_FILE);
	}

	/* Free resources */
	destroy_weights ();
	destroy_wheel ();
	return 0;
}
