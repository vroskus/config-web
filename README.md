# @vroskus/config-web

Tool for preparing config.js file. It consumes process.env.<PARAM> and produces .js file with values.

## Installation

Call:

`npm install -D @vroskus/config-web`

`yarn add -D @vroskus/config-web`

## Usage

Just run ```config-web <input file path> <output file path> <start,end identifiers>```

Default input file format:
```
const params: Array<keyof $Config> = [
  'PARAM',
  ...
];
```

If ```<start,end identifiers>``` is defined, the search pattern becomes:
```
<start>
  'PARAM',
  ...
<end>
```

Output file format:
```
var config = {
  PARAM: "VALUE", 
  ...
};
```