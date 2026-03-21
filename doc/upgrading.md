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
