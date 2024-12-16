#!/bin/bash

rm -rf build/packs
rm -rf build/demo
rm -rf build/emception
./build-with-docker.sh
pushd demo
npm run build
popd
nix-shell -p nodejs --command 'npx serve build/demo'