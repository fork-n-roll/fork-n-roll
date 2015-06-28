## Development

```sh
# getting the code
git clone git@github.com:fork-n-roll/fork-n-roll.git

# install redis
brew install redis

# start redis
redis

# install zurb foundation and compass
gem install zurb-foundation
gem install compass

# compile assets and watch for updates
compass watch frontend

# developing
npm install
npm start

# testing
npm test

# deploying (to fork-n-roll.com)
./deploy fnr
```

## Remote server

Download and run [setup.sh](https://github.com/fork-n-roll/fork-n-roll/blob/master/setup.sh) on your remote machine.

See also:

* http://blog.nodeknockout.com/post/66039926165/node-knockout-deployment-setup
* https://github.com/nko4/website/blob/df5c255a626b5c9bb2a1a4e7d4237717d8b4ebb1/scripts/setup/setup-ubuntu.sh
* https://github.com/DonaldDerek/linode-cheat-sheet/blob/18179a0a32ab5c5136d70f2fad55a805a04b891c/README.md#intstall-ffmpeg

## Tips

### Server

* Ubuntu 14.04 - 64-bit
* repo is at: `/home/deploy/current`
* server is at: `/home/deploy/current/server.js`
* worker is at: `/home/deploy/current/worker.js`
* server logs are at: `/home/deploy/shared/logs/server/current`
* worker logs are at: `/home/deploy/shared/logs/worker/current`
* `runit` keeps the server/worker running.
  * `sv restart serverjs` - restarts
  * `sv start serverjs` - starts
  * `sv stop serverjs` - stops
  * `ps -ef | grep runsvdir` - to see logs
  * `cat /etc/service/serverjs/run` - to see the config

You can use the `./deploy` script included in this repo to deploy to your
server right now. Advanced users, feel free to tweak.