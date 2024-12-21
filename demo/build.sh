nix-shell -p nodejs --run 'npm run build'
rm -rf  ../../toywithraylib/web/static/emception 
cp -r ../build/demo ../../toywithraylib/web/static/emception