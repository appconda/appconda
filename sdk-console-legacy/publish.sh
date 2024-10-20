
npm version patch -m "Upgrade to new version"
#git commit -m "version updated"
cp package.json dist
cd dist
#rm index.js
#rm index.js.map
npm publish --access public