<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

# Development

## Using a Cloned Repo as a Linked Plugin

By default, when you add a plugin to a Cordova project, the plugin files are copied into the project. However, during development, it can be easier to link the plugin instead.

Using the `--link` option creates symbolic links to your local copy of the plugin repository instead of copying the files into the project. This means the project uses the same files, so any changes you make, whether from the app's workspace or directly in the plugin, are immediately reflected.

To add a linked plugin, run:

```bash
cordova plugin add --link /path/to/cordova-plugin-camera
```

## Testing Main Branch Without Cloning (Unstable)

It is possible to install the plugin from the GitHub repository URL.

```bash
cordova plugin add https://github.com/apache/cordova-plugin-camera.git
```

While this is possible, the preferred approach for development is to clone and link the plugin's repository, as this makes it easier to prepare changes for potential pull requests.

## Linting

During development, you should run the linter to ensure the code follows our coding standards:

```bash
npm run lint
```

### Fixing Lint Issues

In many cases, lint warnings can be fixed automatically with:

```bash
npm run lint:fix
```

If an issue cannot be resolved automatically, it will require manual review and correction.

## Building from Source

1. **Clone the repository** locally.

2. **Change to the repository directory.**

3. **Install dependencies:**

    ```bash
    npm install
    ```

    Installs all production and development dependencies required for using and developing the package.

4. **Update sub-dependencies:**

    ```bash
    npm update
    ```

    Over time, `package-lock.json` can become stale and may trigger audit warnings. `npm update` refreshes dependencies within the pinned versions.

    Under normal circumstances, users install the published package from the npm registry, which does **not** include its own `package-lock.json`. Instead, npm resolves and installs the latest compatible dependency versions at install time, which may result in no audit warnings.

    Running `npm update` locally can provide a more accurate representation of current npm audit results for the project.

5. **Generate a tarball:**

    ```bash
    npm pack
    ```

    Creates a `.tgz` tarball file in the `.asf-release` directory. This tarball file can be installed in a Cordova project via:

    ```bash
    cordova plugin add /path/to/package.tgz
    ```
