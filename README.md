# TinyRequest
Tiny Http Request Helper for nodejs.

## Why
I build a lots of small script that need to make http requestion to works, after some webpack shrinking, my final script are all above 350Ko.

99% of http request I made are simple and do not need fendzy http request, for those usage I'm now using this Http-helper, 99% of http request code is allready present in nodejs core.

So now all my http small shrink by 300-350Ko.

## interface

The inteface is a bit like got


```typescript
import TinyRequest from "tinyrequest";

// do a simple GET request
let req = await TinyRequest('http://domain/path');

// do a simple GET request with a node request object
let req = await TinyRequest({ protocol: 'https:', domain: 'domain', path: '/', headers: {'x-token': 'token'}});

// do a simple POST request with plain text payload
let req = await TinyRequest.post('http://domain/path', {text: 'text payload'});

// do a simple POST request with json payload
let req = await TinyRequest.post('http://domain/path', {json: {text: 'text payload'}});

// do a simple PUT request with x-form payload
let req = await TinyRequest.put('http://domain/path', {form: {text: 'text payload'}});
```

## limitataton

- Only support Http request with in memory payload / response (no stream).
- Do not follow redirect.
- Only work in nodeJS.
- Only throw error on connection Error.
- All response are handle as success, so always check the response code.





