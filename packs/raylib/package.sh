#!/bin/bash

SRC=$(dirname $0)
BUILD="$1"

if [ "$BUILD" == "" ]; then
    BUILD=$(pwd)/build
fi

SRC=$(realpath "$SRC")
BUILD=$(realpath "$BUILD")

mkdir -p $BUILD/packs/raylib

cp -Rf $SRC/raylib $BUILD/packs/raylib/

pushd $BUILD/packs/raylib
$BUILD/tooling/wasm-package pack $BUILD/packs/raylib/raylib.pack $(find raylib/)
popd
