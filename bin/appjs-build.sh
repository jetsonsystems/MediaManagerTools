#!/bin/bash

BUILD_DIR=""
if [[ $# == 1 ]] ; then
  BUILD_DIR=$1
  if [[ -d $BUILD_DIR ]] ; then
    echo "$BUILD_DIR already exists..."
  else
    echo "Creating $BUILD_DIR..."
    mkdir $BUILD_DIR
    if [[ ! -d $BUILD_DIR ]] ; then
      echo "Failed to create $BUILD_DIR..."    
      exit 0
    fi

  fi
else
  echo "USAGE: $0 <build dir>"
  exit -1
fi

echo "Building in $BUILD_DIR"

cd $BUILD_DIR

git clone git@github.com:appjs/appjs.git
# git clone git@github.com:jetsonsystems/appjs.git
export NVERSION="0.8.11";
export CEFVERSION="1.1180.724";
export N32BASE=`pwd`/appjs/node-32/${NVERSION}

pushd appjs

mkdir -p node-32/${NVERSION} node-32/src
cd node-32/src/
curl -L -O http://nodejs.org/dist/v${NVERSION}/node-v${NVERSION}.tar.gz
tar -xzf node-v0.8.11.tar.gz 
cd node-v0.8.11
./configure --prefix=${N32BASE} --dest-cpu=ia32
make
make install
cd ../../..

export PATH="${N32BASE}/bin:${PATH}"
# npm install -g node-gyp
./node-32/0.8.11/bin/npm  install ./node-32/0.8.11/lib/node_modules/npm/node_modules/node-gyp/ -g
mkdir node_modules
./node-32/0.8.11/bin/npm install mime

mkdir deps
pushd deps

curl -k -L -O https://github.com/downloads/appjs/appjs/cef_binary_${CEFVERSION}_darwin_ia32.tar.gz
tar -xzf cef_binary_${CEFVERSION}_darwin_ia32.tar.gz
ln -s cef_binary_${CEFVERSION}_darwin_ia32 cef

# deps
popd

pushd data/mac/node-bin/
ln -s ../../../node-32/0.8.11 node
popd

./node-32/0.8.11/bin/node ./node-32/0.8.11/bin/node-gyp configure
./node-32/0.8.11/bin/node ./node-32/0.8.11/bin/node-gyp build

pushd app/data/bin
echo "Linking in `pwd`..."
echo "Ls: `ls -l`"
rm -f node
ln -s ../../../node-32/0.8.11/bin/node node
popd

#
# appjs
#
popd
pwd

echo "Build comnplete."
echo "Run the sample: $BUILD_DIR/appjs/app/app.sh..."
echo ""
exit 0
