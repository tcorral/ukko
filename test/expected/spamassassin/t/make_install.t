#!/usr/bin/perl

use lib '.'; use lib 't';
$ENV{'TEST_PERL_TAINT'} = 'no';     # inhibit for this test
use SATest; sa_t_init("make_install");

use Test; plan tests => 25;

BEGIN { 
  if (-e 't/test_dir') {
    chdir 't';
  }

  if (-e 'test_dir') {
    unshift(@INC, '../blib/lib');
  }

};

# -------------------------------------------------------------------

use Cwd;
my $cwd = getcwd;
my $builddir = "$cwd/log/d.$testname/build";
my $instbase = "$cwd/log/d.$testname/inst";
system("rm -rf $instbase $builddir");
system("mkdir -p $instbase $builddir");

sub system_or_die;
system_or_die "cd .. && make tardist";
system_or_die "cd $builddir && gunzip -cd $cwd/../Mail-SpamAssassin-*.tar.gz | tar xf -";
system_or_die "cd $builddir && mv Mail-SpamAssassin-* x";

#Fix for RH/Fedora using lib64 instead of lib - bug 6609
$x64_bit_lib_test = 0;
if (-e '/bin/rpm') {
  #More logic added from bug 6809
  #Are we running an RPM version of Perl?
  $command = "/bin/rpm -qf $^X";
 
  $output = `$command`;
  if ($output =~ /not owned by any package/i) {
    #WE AREN'T RUNNING AN RPM VERSION OF PERL SO WILL ASSUME NO LIB64 DIR
    #is there a test we can run for this?
  } else {

    $command = '/bin/rpm --showrc';

    @output = `$command`;

    foreach $output (@output) {
      if ($output =~ /-\d+: _lib(dir)?\t(.*)$/) {
        if ($2 && $2 =~ /64/) {
          $x64_bit_lib_test++;
        }
      }
    }
  }
}

#Fix for x86/64 Gentoo
if (-e '/usr/bin/emerge' && -d '/usr/lib64') {
  $x64_bit_lib_test++;
}

if ($x64_bit_lib_test) {
  print "\nEnabling checks for 64 bit lib directories.\n";
} else {
  print "\nDisabling checks for 64 bit lib directories.\n";
}

sub new_instdir {
  $instdir = $instbase.".".(shift);
  print "\nsetting new instdir: $instdir\n";
  system("rm -rf $instdir; mkdir $instdir");
}

sub run_makefile_pl {
  my $args = $_[0];
  system_or_die "cd $builddir/x && $perl_cmd Makefile.PL ".
          "$args < /dev/null 2>&1";
  system_or_die "cd $builddir/x && make install 2>&1";
  print "current instdir: $instdir\n";
}

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "PREFIX=$instdir/foo";

ok -d "$instdir/foo/bin";
if ($x64_bit_lib_test) {
  #print "testing for $instdir/foo/lib64";
  ok -d "$instdir/foo/lib64";
} else {
  ok -d "$instdir/foo/lib";
}

ok -e "$instdir/foo/share/spamassassin";
ok -e "$instdir/foo/etc/mail/spamassassin";

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "PREFIX=$instdir/foo LIB=$instdir/bar";

ok -e "$instdir/foo/bin";
ok -e "$instdir/bar/Mail/SpamAssassin";
ok -e "$instdir/foo/share/spamassassin";
ok -e "$instdir/foo/etc/mail/spamassassin";

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "PREFIX=$instdir/foo LIB=$instdir/bar DATADIR=$instdir/data";

ok -e "$instdir/foo/bin";
ok -e "$instdir/bar/Mail/SpamAssassin";
ok -e "$instdir/data/sa-update-pubkey.txt";
ok !-e "$instdir/foo/share/spamassassin";
ok -e "$instdir/foo/etc/mail/spamassassin";

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "PREFIX=$instdir/foo SYSCONFDIR=$instdir/sysconf";

ok -e "$instdir/foo/bin";
ok -e "$instdir/sysconf/mail/spamassassin/local.cf";
ok -e "$instdir/foo/share/spamassassin/sa-update-pubkey.txt";
ok !-e "$instdir/foo/etc/mail/spamassassin";

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "PREFIX=$instdir/foo CONFDIR=$instdir/conf";

ok -e "$instdir/foo/bin";
ok -e "$instdir/conf/local.cf";
ok -e "$instdir/foo/share/spamassassin/sa-update-pubkey.txt";
ok !-e "$instdir/foo/etc/mail/spamassassin";

# -------------------------------------------------------------------
new_instdir(__LINE__);
run_makefile_pl "DESTDIR=$instdir/dest PREFIX=/foo";

ok -d "$instdir/dest/foo/bin";
ok -d "$instdir/dest/foo/etc/mail/spamassassin";
if ($x64_bit_lib_test) {
  ok -d "$instdir/dest/foo/lib64";
} else {
  ok -d "$instdir/dest/foo/lib";
}
ok -e "$instdir/dest/foo/share/spamassassin/sa-update-pubkey.txt";

