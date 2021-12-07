import https from 'https';
import http, { IncomingHttpHeaders } from 'http';
import querystring from 'querystring';
import { URL } from 'url';
import { ParsedUrlQueryInput } from 'querystring';

export interface TinyRequestBodyJson {
    json: any;
}

export interface TinyRequestBodyText {
    text: string,
}

export interface TinyRequestBodyForm {
    form: ParsedUrlQueryInput
}

export interface TinyRequestBodyBuffer {
    raw: Buffer | Uint8Array;
}

export type TinyRequestBody = TinyRequestBodyJson | TinyRequestBodyText | TinyRequestBodyForm | TinyRequestBodyBuffer;

export class TinyResponse {
    private chunks: any[] = [];
    private waiter: Promise<void>;

    constructor(/*private client: http.ClientRequest, */private res: http.IncomingMessage) {
        this.waiter = new Promise((accept) => {
            res.on('data', chunk => this.chunks.push(chunk))
            res.once('end', () => accept())
        })
    }

    get headers(): IncomingHttpHeaders {
        return this.res.headers;
    }

    get statusText(): string {
        return this.res.statusMessage || '';
    }
    get statusMessage(): string {
        return this.statusText;
    }

    get code(): number {
        return this.statusCode;
    }

    get statusCode(): number {
        return this.res.statusCode || 0;
    }

    async text(): Promise<string> {
        await this.waiter;
        return this.chunks.map((chunk) => chunk.toString()).join('');
    }

    async json<T = any>(): Promise<T> {
        const text = await this.text();
        return JSON.parse(text);
    }
}

function toOption(options: https.RequestOptions | string | URL): https.RequestOptions {
    if ('string' === typeof options) {
        options = new URL(options);
    }
    if (options instanceof URL) {
        return { host: options.host, hostname: options.hostname, port: options.port, protocol: options.protocol, path: options.pathname, method: 'GET' };
    } else {
        return options;
    }
}

export function post(options: https.RequestOptions | string | URL, body: TinyRequestBody) {
    const opt = toOption(options);
    opt.method = 'POST';
    return TinyRequest(opt);
}

export function get(options: https.RequestOptions | string | URL) {
    return TinyRequest(options);
}

export function put(options: https.RequestOptions | string | URL, body: TinyRequestBody) {
    const opt = toOption(options);
    opt.method = 'PUT';
    return TinyRequest(opt);
}

const CT = 'content-type';
export function TinyRequest(options: https.RequestOptions | string | URL, body?: TinyRequestBody): Promise<TinyResponse> {
    return new Promise<TinyResponse>((accept, reject) => {
        const opt = toOption(options);
        if (!opt.headers) {
            opt.headers = {};
        }
        const headers = opt.headers;
        let uploadData: null | string | Buffer | Uint8Array | string = null;
        if (body) {
            if ('json' in body) {
                if (!headers[CT]) {
                    headers[CT] = 'application/json;charset=UTF-8';
                }
                uploadData = JSON.stringify(body.json);
            } else if ('form' in body) {
                if (!headers[CT]) {
                    headers[CT] = 'application/x-www-form-urlencoded';
                }
                uploadData = querystring.stringify(body.form)
            } else if ('raw' in body) {
                uploadData = body.raw
            } else if ('text' in body) {
                uploadData = body.text
            }
        if (uploadData)
                headers['Content-Length'] = String(uploadData.length);
        }
        let client: http.ClientRequest;
        if (opt.protocol === 'https:') {
            client = https.request(opt, res => {
                accept(new TinyResponse(/*client, */res));
            })
        } else {
            client = http.request(opt, res => {
                accept(new TinyResponse(/*client, */res));
            })
        }
        client.once('error', error => {
            reject(error);
        })
        if (uploadData) {
            client.write(uploadData)
        }
        client.end()
    })
}

TinyRequest.get = get;
TinyRequest.put = put;
TinyRequest.post = post;

export default TinyRequest;