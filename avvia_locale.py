#!/usr/bin/env python3
"""Local app-shell server. No endpoints to receive vehicle or customer records."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse, ssl, webbrowser
ROOT=Path(__file__).resolve().parent
CSP="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'"
ALLOWED={'/','/index.html','/app.css','/app.js','/core.js','/reports.js','/crypto.js','/storage.js','/sw.js','/manifest.webmanifest','/assets/meccanico.webp','/assets/icon-180.png','/assets/icon-192.png','/assets/icon-512.png'}
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'text/javascript','.webmanifest':'application/manifest+json','.webp':'image/webp'}
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if unquote(urlsplit(self.path).path) not in ALLOWED:self.send_error(404);return
        super().do_GET()
    def do_HEAD(self):
        if unquote(urlsplit(self.path).path) not in ALLOWED:self.send_error(404);return
        super().do_HEAD()
    def end_headers(self):
        self.send_header('Content-Security-Policy',CSP)
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
        self.send_header('Cache-Control','no-cache')
        if self.path=='/sw.js':self.send_header('Service-Worker-Allowed','/')
        super().end_headers()
    def log_message(self,*args):pass

def main():
    parser=argparse.ArgumentParser(description='Avvia Officina sul computer. Per rete locale usa HTTPS con certificato attendibile.')
    parser.add_argument('--host',default='127.0.0.1');parser.add_argument('--port',type=int,default=8080)
    parser.add_argument('--cert');parser.add_argument('--key');parser.add_argument('--no-browser',action='store_true')
    args=parser.parse_args()
    if bool(args.cert)!=bool(args.key):parser.error('Specifica sia --cert sia --key.')
    if args.host not in ('127.0.0.1','localhost') and not args.cert:parser.error('Per esporre l’app in rete locale occorre HTTPS: specifica --cert e --key.')
    server=ThreadingHTTPServer((args.host,args.port),Handler)
    if args.cert:
        context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.minimum_version=ssl.TLSVersion.TLSv1_2
        context.load_cert_chain(args.cert,args.key);server.socket=context.wrap_socket(server.socket,server_side=True)
    scheme='https' if args.cert else 'http';display_host='localhost' if args.host in ('127.0.0.1','localhost') else args.host
    url=f'{scheme}://{display_host}:{args.port}/'
    print('Officina è disponibile su: '+url,flush=True)
    print('Lascia questa finestra aperta durante il primo caricamento. Per terminare: Ctrl+C.',flush=True)
    if not args.no_browser and args.host in ('127.0.0.1','localhost'):webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
if __name__=='__main__':main()
