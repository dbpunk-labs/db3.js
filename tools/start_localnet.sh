#! /bin/base
#
# start_localnet.sh
killall db3 tendermint
DB3_VERSION=`curl -s https://api.github.com/repos/dbpunk-labs/db3/releases/latest | python3  -c 'import sys, json; print(json.load(sys.stdin)["name"])'`
test_dir=`pwd`
BUILD_MODE='debug'
if [[ $1 == 'release' ]] ; then
  BUILD_MODE='release'
fi

echo "BUILD MODE: ${BUILD_MODE}"
if [ -e ./db3/bin/tendermint ]
then
    echo "tendermint exist"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/dbpunk-labs/db3/releases/download/${DB3_VERSION}/db3-${DB3_VERSION}-linux-x86_64.tar.gz
        tar -zxf db3-${DB3_VERSION}-linux-x86_64.tar.gz
        mv -f db3-${DB3_VERSION}-linux-x86_64 db3
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        wget https://github.com/dbpunk-labs/db3/releases/download/${DB3_VERSION}/db3-${DB3_VERSION}-macos-x86_64.tar.gz
        tar -zxf db3-${DB3_VERSION}-macos-x86_64.tar.gz
        mv -f db3-${DB3_VERSION}-macos-x86_64 db3
    else
        echo "$OSTYPE is not supported, please give us a issue https://github.com/dbpunk-labs/db3/issues/new/choose"
        exit 1
    fi
fi

cd db3
# clean db3
killall -s 9 db3
if [ -e ./db ]
then
    rm -rf db
fi
if [ -e ./indexer ]
then
    rm -rf indexer
fi
./bin/tendermint init
./bin/db3 start >db3.log 2>&1  &
sleep 1
./bin/tendermint unsafe_reset_all && ./bin/tendermint start
sleep 1

