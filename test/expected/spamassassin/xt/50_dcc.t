
#!/usr/bin/perl
  (-d "../t") and chdir "..";
  system( "$^X", "t/dcc.t",
        "--override", "run_dcc_tests", "1", @ARGV);
  ($? >> 8 == 0) or die "exec failed";
  

