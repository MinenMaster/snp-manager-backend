# SNP-Manager (ShallNotPass-word Manager)

> Link to the SNP-Manager-Frontend: https://github.com/MinenMaster/snp-manager-frontend

### Install dependencies

**Node.js:**

```powershell
# installs fnm (Fast Node Manager)
winget install Schniz.fnm
# configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression
# download and install Node.js
fnm use --install-if-missing 22
# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`
# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
```

**Install project dependencies:**

```bash
# installs all required packages
npm install
```
