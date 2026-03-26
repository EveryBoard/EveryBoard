# Lib
It is easier to start with upgrading lib, as there are way less dependencies.
To see what's outdated:
```
cd lib/
npm outdated
```
Then, update to the latest "wanted" version, before upgrading to the latest actual version. Run the tests in the middle to make sure all is well:
```
npm update
npm test
npm outdated
npm install jasmine@latest ...
npm test
```

# Frontend
Start like lib, but then you have to be careful with angular. Follow the guide: https://angular.dev/update-guide?v=18.0-21.0&l=3
You can also do the angular migrations when needed: https://angular.dev/reference/migrations

Recommended way of progressing:
- upgrade everything else than angular first
- upgrade one angular version at a time
- commit between each angular version upgrade and each migration

Watch out! You might need to use a specific version of npm. Use nvm for this (in bash preferably). Otherwise, the package-lock might be out of sync for the CI, but work fine locally.
# Backend
To see which direct dependency is outdated:
```
go list -m -u -f '{{if and .Update (not .Indirect)}}{{.}}{{end}}' all
```


Upgrade all dependencies recursively and update the "package lock"
```
cd backend
go get -u ./...
go mod tidy
```
