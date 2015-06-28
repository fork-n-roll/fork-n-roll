set -evu

if [ -z $1 ]; then
  echo "USAGE: $0 hostname"
  exit 1
fi

# Set the hostname
hostname=$1
hostname $hostname
echo "$hostname" > /etc/hostname

# Updating apt packages...
apt-get update

# Installing git...
apt-get install -y git-core

# Installing node...
apt-get install -y python-software-properties python g++ make
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

# Setting NODE_ENV=production...
echo "export NODE_ENV=production" > /etc/profile.d/NODE_ENV.sh
echo "export PORT=80" >> /etc/profile.d/NODE_ENV.sh

# Setting up the root user .ssh/ dir...
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys ~/.ssh/known_hosts
chmod 600 ~/.ssh/authorized_keys ~/.ssh/known_hosts

# Adding github.com to ~/.ssh/known_hosts...
cat <<EOS >> ~/.ssh/known_hosts
github.com,207.97.227.239 ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
EOS

# Setting up the deploy user...
id deploy || useradd -U -m -s /bin/bash deploy

# Setting up the deploy user .ssh/ dir...
deploy_home=/home/deploy
cp -r ~/.ssh $deploy_home/.ssh
chown -R deploy $deploy_home/.ssh

# Setting up runit...
apt-get install -y runit

# Setting runit to run server.js...
serverjs_etc=/etc/service/serverjs
mkdir -p $serverjs_etc/log

cat <<EOS > $serverjs_etc/run
#!/bin/sh
exec 2>&1
. /etc/profile
. $deploy_home/.profile
exec node $deploy_home/current/server.js
EOS
chmod +x $serverjs_etc/run

# Setting up runit logging...
mkdir -p $deploy_home/shared/logs/server

cat <<EOS > $serverjs_etc/log/run
#!/bin/sh
exec svlogd -tt $deploy_home/shared/logs/server
EOS
chmod +x $serverjs_etc/log/run

# Waiting for runit to recognize the new service...
while [ ! -d $serverjs_etc/supervise ]; do
  sleep 5 && echo "waiting..."
done
sleep 1

# Turning off the server until the first deploy...
sv stop serverjs
> $deploy_home/shared/logs/server/current

# Giving the deploy user the ability to control the service...
chown -R deploy $serverjs_etc/supervise
chown -R deploy $deploy_home/shared

# Install ffmpeg
# Prepare the environment
sudo apt-get -y install build-essential checkinstall git libfaac-dev libgpac-dev \
  libjack-jackd2-dev libmp3lame-dev libopencore-amrnb-dev libopencore-amrwb-dev \
  libsdl1.2-dev libtheora-dev libva-dev libvdpau-dev libvorbis-dev libx11-dev \
  libxfixes-dev texi2html yasm zlib1g-dev

# Install x264
cd ~/tmp/
git clone git://git.videolan.org/x264
cd x264
./configure --enable-static --disable-asm
make
sudo checkinstall --pkgname=x264 --pkgversion="3:$(./version.sh | \
  awk -F'[" ]' '/POINT/{print $4"+git"$5}')" --backup=no --deldoc=yes \
  --fstrans=no --default

# Install ffmpeg
cd ~/tmp/
git clone --depth 1 git://source.ffmpeg.org/ffmpeg
cd ffmpeg
./configure --enable-gpl --enable-libfaac --enable-libmp3lame --enable-libopencore-amrnb \
  --enable-libopencore-amrwb --enable-libtheora --enable-libvorbis \
  --enable-libx264 --enable-nonfree --enable-version3 --enable-x11grab
make
sudo checkinstall --pkgname=ffmpeg --pkgversion="5:$(date +%Y%m%d%H%M)-git" --backup=no \
  --deldoc=yes --fstrans=no --default
hash x264 ffmpeg ffplay ffprobe

# Setting runit to run worker.js...
workerjs_etc=/etc/service/workerjs
mkdir -p $workerjs_etc/log

cat <<EOS > $workerjs_etc/run
#!/bin/sh
exec 2>&1
. /etc/profile
. $deploy_home/.profile
exec node $deploy_home/current/worker.js
EOS
chmod +x $workerjs_etc/run

# Setting up runit logging...
mkdir -p $deploy_home/shared/logs/worker

cat <<EOS > $workerjs_etc/log/run
#!/bin/sh
exec svlogd -tt $deploy_home/shared/logs/worker
EOS
chmod +x $workerjs_etc/log/run

# Giving the deploy user the ability to control the service...
chown -R deploy $workerjs_etc/supervise
chown -R deploy $deploy_home/shared

# Create database directory
mkdir -p $deploy_home/source/db/fnr.git
echo "export GIT_PATH=$deploy_home/source/db/fnr.git" >> /etc/profile.d/NODE_ENV.sh