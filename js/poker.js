/**
 * Created with JetBrains PhpStorm.
 * User: lispad
 * Date: 13.04.13
 * Time: 17:47
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){
    initHistoryApi();
    initContainers();
    $('.navbar-inner > ul.nav > li > ._connect').click(function(){
        connectPressed();
    });

}.bind(window));


function initContainers(){
    window.log=new Chat($('.page.chat > textarea'));
}

function connectPressed(){
    if (typeof CS=='undefined'  || !CS.isConnected())
        connect();
    else
        disconnect();
}

function connect(){
    var buf='';
    /* Connection is set on creating, we have to recreate websocket to reconnect */
    window.CS=new LWebSocket("localhost", 8080);
    CS.bind('connect',function(){
        log.add("==Connected to WebSocket==\n");
        $('.navbar-inner > div > ._status').removeClass('badge-important').removeClass('badge-info').addClass('badge-success').text('connected');
    });

    CS.bind('disconnect',function(){
        log.add("==Socket closed (not connected):==\n");
        $('.navbar-inner > div > ._status').removeClass('badge-success').removeClass('badge-info').addClass('badge-important').text('disconnected');
    });

    CS.bind('receive', function(data){
        log.push(data);
//        buf+=data;
//        var received=buf.split("\n");
//        buf=received.pop()
//        received.forEach(function(value){
//            log.add(value);
//        })
    });

    log.bind(function(key){
        CS.send(key);
    }.bind(this));

    $('.navbar-inner > div > ._status').removeClass('badge-important').removeClass('badge-success').addClass('badge-info').text('connecting');
    CS.connect();
}

function disconnect(){
    CS.disconnect();
}

LWebSocket=function (addr, port){
    this._addr=addr;
    this._port = port;
    this._ws = null;
    this._listeners={
        connect:[],
        disconnect:[],
        receive:[]
    };

    this.isConnected=function() {
        return this._ws.readyState==this._ws.OPEN;
    };

    this.setPort = function (port){
        this._port=port;
    };

    this.send = function (buffer){
        if (this.isConnected())
            this._ws.send(buffer);
    };

    this.bind = function (type, callback){
        if (typeof this._listeners[type]!='undefined')
            this._listeners[type].push(callback);
    };

    this.connect = function(){
        this._ws = new WebSocket('ws://'+this._addr+':'+this._port);

        this._ws.onopen = function() {
            this._listeners.connect.forEach(function(callback){callback();});
        }.bind(this);

        this._ws.onmessage = function (evt) {
            this._listeners.receive.forEach(function(callback){callback(evt.data);});
        }.bind(this);

        this._ws.onclose = function(ev) {
            this._listeners.disconnect.forEach(function(callback){callback();});
        }.bind(this);
    };

    this.disconnect=function(){
        this._ws.close();
    };
};

Chat=function(area){
    this._area=null;
    this._callback=null;
    this._echo=false;

    this.setArea=function(area){
        if (area instanceof $)
            this._area=area.get(0);
        else
            this._area=area||null;

        $(this._area).on('keypress',function(event){
            var key=String.fromCharCode(parseInt(event.charCode));
            if (this._callback!=null)
                this._callback(key);
            return this._echo;
        }.bind(this));
    };
    this.add=function(text){
        if (this._area.value.length>1024)
            this._area.value=this._area.value.substr(0, 1024);
        this._area.value=text+this._area.value;
    };
    this.push=function(text){
        this._area.value+=text;
    }
    this.clear=function(){
        this._area.value='';
    };
    this.bind=function (callback){
        this._callback=callback;
    };
    this.echo=function (enabled){
        this._echo=enabled;
    };

    this.setArea(area);
};


function goToPage(url){
    $('.navbar-inner > ul.nav > li').removeClass('active');
    $('.navbar-inner > ul.nav').children('.'+url).addClass('active');
    $('.page').hide();
    $('.page.'+url).show();
//    window.history.pushState(null,url, url);
}

function initHistoryApi(){
    window.addEventListener('popstate', function(event){
        var url=location.hash.replace("#",'')||location.pathname.replace("/",'');
        if (url)
            goToPage(url);
    }, false);
}

