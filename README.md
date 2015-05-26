[![npm](https://img.shields.io/npm/l/ukko.svg)](https://www.npmjs.org/package/ukko)
[![npm](https://img.shields.io/npm/v/ukko.svg)](https://www.npmjs.org/package/ukko)
[![Build Status](https://travis-ci.org/tcorral/ukko.svg?branch=master)](https://travis-ci.org/tcorral/ukko)
[![Coverage Status](https://coveralls.io/repos/tcorral/ukko/badge.svg)](https://coveralls.io/r/tcorral/ukko)
[![Code Climate](https://codeclimate.com/github/tcorral/ukko/badges/gpa.svg)](https://codeclimate.com/github/tcorral/ukko)
[![Dependency Status](https://david-dm.org/tcorral/ukko.svg?theme=shields.io&style=flat)](https://david-dm.org/tcorral/ukko)
[![devDependency Status](https://david-dm.org/tcorral/ukko/dev-status.svg?theme=shields.io&style=flat)](https://david-dm.org/tcorral/ukko#info=devDependencies)


# ukko

Ukko was created as a simple tool to install your development environment at once, but it can also be used to:

* create sym links to folders in your computer
* download a repo from any repo source (Git, SVN, GITHUB, STASH...)
* download and extract any zip, rar, tar, tar.gz, war...

## Installation

### Node 

Dependencies:

* node >= 0.10
* npm >= 2.0.0

```bash
npm install ukko --save
```

## Usage

Ukko usage is very simple, it just needs a source to retrieve an object with an ukko-conf key with the information
about the endpoints and commands to be executed before and after retrieving the folder/repo/file.
          
```js
var ukko = require('ukko');
ukko.installOrUpdate({
    data: {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        }
    }
});
``` 
 
### API

#### installOrUpdate
`ukko.installOrUpdate` gets an argument to be executed:

##### Arguments
* `config {Object}` 

##### Returns
* `void`

### Config Object
The expected configuration could be a JSON file or a javascript object passed directly 
to the  `installOrUpdate` method.

#### Examples of basic config objects

JSON objects:

##### Shared dependencies only

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        }
    }
}
```

##### Production environment dependencies by default

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        },
        "production": {
            "target/folder/path/from/the/root2": "path/or/url/to/repo2"
        }
    }
}
``` 
     
##### Development environment dependencies by default

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        },
        "development": {
            "target/folder/path/from/the/root2": "path/or/url/to/repo2"
        }
    }
}
```     
     
##### Custom environment dependencies

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        },
        "localEnv": {
            "target/folder/path/from/the/root2": "path/or/url/to/repo2"
        }
    }
}
```

#### Properties of the config object

##### `data`

##### Type
* `{Object}` 


It can be used to pass the configuration directly to the function in

```json
{
    "data": {
        "dependencies": {
            "target/folder/path/from/the/root": "path/or/url/to/repo"
        }
    }
}
```

##### `configPath`

##### Type
* `{String}` 

It expects a path to the json config file.
It can be a folder path in your computer or an url to access it remotely.
When we pass the config path it can not be used in conjunction with data property.
The config path will try to find the config file and if it doesn´t find the
file it will fallback to read the config from the package.json.


###### local usage

```json
{
    "configPath": "path/to/your/ukko-conf.json"
}
``` 

###### remote

Remote URL can be an http/https/ftp

```json
{
    "configPath": "http://path/to/your/ukko-conf.json"
}
```

##### `repos`

##### Type
* `{Array<>String}`

Ukko install all the repos from the endpoints by default but you can specify 
an array of repos to be downloaded. The repos should be an array of target 
folders or keys.


```json
{
    "configPath": "http://path/to/your/ukko-conf.json",
    "repos": [ "target/folder/path/from/the/root" ]
}
```

##### `detached-processes`

##### Type
* `{Array<>String}`

Ukko checks if we supply some commands to be executed, this commands could be executed 
before or after download the code from the specified endpoint, but there are some commands 
that need to be executed in some background thread to bypass the parent process, as example 
you can need to execute some server or watching process.
  

```json
{
    "configPath": "http://path/to/your/ukko-conf.json",
    "detached": [ "mvn jetty:run" ]
}
```

##### `save-report`

##### Type
* `{Boolean}`

As commented in the previous point some commands will be executed in the background, this property
tells ukko to save the log of these processes.
                    
##### Define an endpoint

The endpoints should be inside any of the defined environments or inside the 
shared dependencies object.
There are some different ways to define and endpoint and I will show you some of them.
                            
Ukko detects if the repository exist or not, then it decides what is needed to do if a 
complete checkout or an update.

###### Simple

###### - FileSystem (basic, git, svn)

```json
{
    "ukko-conf" : {
        "dependencies": {
            "target/path" : "path/to/my/source"
        }
    }
}
```

###### - Git repository

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "https://example.com/gitproject.git"
        }
    }
}
```

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "ssh://user@server/project.git"
        }
    }
}
```

###### - SVN repository

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "http://svn.red-bean.com/repos/test"
        }
    }
}
```

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "svn://<your_ip>/<repository_name>"
        }
    }
}
```

###### - Github repository

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "https://github.com/user/repo.git"
        }
    }
}
```

###### - Compressed file url

Compressed files could be: zip, tar, tar.gz, war

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : "http://myserver.com/path/repo.zip"
        }
    }
}
```

###### Post-commands simple  

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : {
                "endpoint": "https://example.com/gitproject.git",
                "commands": [ "mvn clean install -DskipTests" ]
            }
        }
    }
}
```

###### Pre-commands 

```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : {
                "endpoint": "https://example.com/gitproject.git",
                "commands": {
                    "pre": [ "mvn clean install -DskipTests" ]
                }
            }
        }
    }
}
```

###### Pre and post commands
  
```json
{
    "ukko-conf": {
        "dependencies": {
            "target/path" : {
                "endpoint": "https://example.com/gitproject.git",
                "commands": {
                    "pre": [ "ls -la" ],
                    "post": [ "mvn clean install -DskipTests" ]
                }
            }
        }
    }
}
```

To get more info I recommend to read the use cases in tests.

## Tests

To run the tests with NodeUnit:

```bash
npm install
npm test
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Check that it still works: `npm test`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

0.0.32 - First fully working commit.

## License

The MIT License (MIT)

Copyright (c) 2015 Tomás Corral

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.