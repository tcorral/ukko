
#!/usr/bin/perl
  (-d "../t") and chdir "..";
  system( "$^X", "t/dnsbl_sc_meta.t",
        "--override", "run_net_tests", "1", @ARGV);
  ($? >> 8 == 0) or die "exec failed";
  

