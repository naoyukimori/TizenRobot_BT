/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true, devel: true, maxerr: 999 */
/*global $, tizen, app */
/**
 * @class Model
 */
function RobotKondoModel(parent) {
	'use strict';
	this.client = parent;
	this.init();
}

(function () { // strict mode wrapper
	'use strict';
	RobotKondoModel.prototype = {

		/**
		 * API module initialisation
		 */
		init: function ClientModel_init() {},

		searchServer: function ClientModel_searchServer() {
			var discoverDevicesSuccessCallback = {
				onstarted: function () {
					this.client.setDiscovering(true);
				}.bind(this),
				ondevicefound: function (device) {
					this.client.addDeviceToList(device);
				}.bind(this),
				ondevicedisappeared: function (address) {},
				onfinished: function (devices) {
					this.client.setDiscovering(false);
				}.bind(this)
			};

			this.client.adapter.discoverDevices(discoverDevicesSuccessCallback, function (e) { this.client.setDiscovering(false); });
		},

		stopServerSearching: function ClientModel_stopServerSearching(callback) {
			if (this.client.getDiscovering()) {
				this.client.adapter.stopDiscovery(function () {
					this.client.setDiscovering(false);
					if (typeof callback === 'function') {
						callback();
					}
				}.bind(this), function (e) {
					console.error("Error while stopDiscovery:" + e.message);
				});
			} else if (typeof callback === 'function') {
				callback();
			}
		},

		startBonding: function ClientModel_startBonding(address, callback) {
			this.client.adapter.createBonding(address, function (device) { callback(device); }, function (error) { console.error('bondError: ' + error.message); });
		},

		connectToService: function ClientModel_connectToService(device, serviceUUID, successCallback, errorCallback) {
			this.client.chatServerDevice = device;
			try {
				device.connectToServiceByUUID(serviceUUID, successCallback, errorCallback, 'RFCOMM');
			} catch (error) {
				console.error('connectToServiceByUUID ERROR: ' + error.message);
			}
		},

		sendPing: function ClientModel_sendPing(name, socket) {
			var sendTextMsg, messageObj, messageObjToString, i, len;
			sendTextMsg = ['0x04', '0xFE', '0x06', '0x08' ];
			/*
			messageObj = {name: encodeURIComponent(name), text: '', ping: true, bye: false};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}

			_Bool rcb4_confirm ()
			{
				// 生存確認コマンドを発行
				// 0x04:命令バイト数、0xFE:生存確認コマンド、0x06:生存確認データ、0x08:SUM
				byte cmd[4] = {0x04, RCB4_CMD_AckCheck, RCB4_Ack, 0x08};
				byte rx[4] = {0, 0, 0, 0}, i;
			*/
			
			console.log('app.robot.kondo.model.ClientModel_sendPing(): will: ' + sendTextMsg);
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
					console.log('sendPing done: ' + sendTextMsg);
				}
			} catch (error) {
				console.error('sendPing: ' + error.message + ", msg=" + sendTextMsg);
			}
		},

		sendMessage: function ClientModel_sendMessage(name, socket, message, callback) {
			var sendTextMsg = [], messageObj, messageObjToString, i, len;
			/* 
			name = encodeURIComponent(name);
			message = encodeURIComponent(message);
			messageObj = {name: name, text: message, ping: false, bye: false};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			*/
			sendTextMsg = message;
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
					callback(message);
				}
			} catch (error) {
				console.error('sendMessage: ' + error.message);
			}
		},

		sendBye: function ClientModel_sendBye(name, socket) {
			var sendTextMsg = [], messageObj, messageObjToString, i, len;
			/*
			name = encodeURIComponent(name);
			messageObj = {name: name, text: '', ping: false, bye: true};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			*/
			//sendTextMsg = "";
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
				}
			} catch (error) {
				console.error('sendBye: ' + error.message);
			}
		},

		playMotion: function ClientModel_playMotion(name, socket, motion_id) {
			var sendTextMsg = [], messageObj, messageObjToString, i, len;
			/*
			name = encodeURIComponent(name);
			messageObj = {name: name, text: '', ping: false, bye: true};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			*/
			/*
			//
// rcb4に記録されているモーションを再生します
//
// EEPROMに保存されているモーションのみ再生します
// rcb4がコマンドを受信できた場合、TRUEを返す
// 関数ポインタが指定されると、再生途中で計算などの処理を実行できます
//
_Bool rcb4_motion_play (
	byte mn           // 再生するモーション番号1 ~ 50
)
{
	// RCB-4に送信するコマンド（最初に必ず初期化しておく）
	byte cmd[19] = {
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
	byte i, sum, rx[5];
	_Bool res;
	unsigned long mot_addr; // KCB-3WLではintも同じ32bit

	if (rcb4_fd < 0)
	{
		printf ("rcb4_motion_play(): RCB-4 is not connected.\n");
		return false;
	}

	// モーション再生には３段階の命令が必要
	// 1) EEPROMの停止とプログラムカウンターの初期化(モーション再生終了後に戻るアドレスの指示)
	// 2) モーション再生コマンドを送る
	// 3) EEPROMから命令の読み込み・実行を再開
	
	// 1) EEPROMからの再生をいったん停止します（rcb4_open関数でシステムオプションは取得済み）
	rcb4_opt.bit.b1 = 0; // EEPROMからプログラムを実行するオプションを停止
	
	// EEPROMからの再生を停止する命令を作成する
	cmd[0]  = 0x13;         // SIZE（コマンド全体のサイズ）
	cmd[1]  = RCB4_CMD_MOV; // CMD（コマンドの種類：MOVE）
	cmd[2]  = RCB4_COM_To_RAM; // TYPE（ここではある数をRAMへ転送する）
	                        // システムオプションアドレスが0x000000なので、cmd[3] ~ cmd[5] = 0
	cmd[6]  = rcb4_opt.byte.low;  // オプション下位８ビットを代入
	cmd[7]  = rcb4_opt.byte.high; // オプション上位８ビットを代入
	cmd[8]  = RCB4_MAINLOOP_LOW;  // メインループのアドレスLOW
	cmd[9]  = RCB4_MAINLOOP_MID;  // メインループのアドレスMID
	cmd[10] = RCB4_MAINLOOP_HIGH; // メインループのアドレスHIGH
	                              // cmd[11] ~ cmd[17] = 0;
	
	// チェックサムcmd[0] ~ cmd[17]を計算する
	cmd[18] = check_sum (cmd, 18);
	
	// コマンドを送受信する
	i = rcb4_cmd_trx (cmd, 19, rx, 4);
	
	if (rx[2] != RCB4_Ack) 
	{
		return false; // コマンド送信結果が失敗した場合はFALSEを返して処理をやめる
	}
	
	// 2) モーション再生コマンドを命令を使って送信する
	// モーションデータのアドレスを作成
	// モーションデータ格納場所は、先頭アドレスが3000(0x0BB8)、一区画2048/4864バイトです
	mot_addr = RCB4_MOTION_SLOT; // HTH4のバージョン違いを確認すること
	mot_addr *= (mn - 1);
	mot_addr += 3000;
	//mot_addr = 4864 * (mn - 1) + 3000; // 左間違い（Ver.1.2.0 Rev20091005）
	
	// モーション再生コマンド（７バイト）を作成する
	cmd[0] = 0x07;           // SIZE（コマンド全体のサイズ）
	cmd[1] = RCB4_CMD_CALL;  // CALL命令
	cmd[2] = mot_addr;       // モーションアドレスの下位８ビット
	cmd[3] = mot_addr >> 8;  // モーションアドレスの中位８ビット
	cmd[4] = mot_addr >> 16; // モーションアドレスの上位８ビット
	cmd[5] = 0x00;
	cmd[6] = cmd[0] + cmd[1] + cmd[2] + cmd[3] + cmd[4] + cmd[5]; // チェックサム
	
	// 作成したモーション再生コマンドを送信する（まだ動作は始まらない）
	i = rcb4_cmd_trx (cmd, 7, rx, 4);
	
	if (rx[2] != RCB4_Ack) 
	{
		return false; // コマンド送信結果が失敗した場合はFALSEを返して処理をやめる
	}
	
	// 3) EEPROMからの再生を開始（実際の動作開始コマンド）
	// システムオプションのEEPROMプログラム実行スイッチをONにする
	rcb4_opt.bit.b1 = 1;
	// ベクタジャンプフラグを０にする
	rcb4_opt.bit.b3 = 0;
	
	// EEPROMからのプログラム実行コマンドを作成する
	cmd[0] = 0x09;         // SIZE（コマンド全体のサイズ）
	cmd[1] = RCB4_CMD_MOV; // CMD（コマンドの種類：MOVE）
	cmd[2] = 0x02;         // TYPE（ここではある数をRAMへ転送する）
	cmd[3] = 0x00;         // システムオプションのアドレスは0x000000
	cmd[4] = 0x00;
	cmd[5] = 0x00;
	cmd[6] = rcb4_opt.byte.low;  // オプション下位８ビットを代入
	cmd[7] = rcb4_opt.byte.high; // オプション上位８ビットを代入
	cmd[8] = cmd[0] + cmd[1] + cmd[2] + cmd[3] + cmd[4] + cmd[5] + cmd[6] + cmd[7]; // チェックサム

	// 作成したモーション再生コマンドを送信する（まだ動作は始まらない）
	i = rcb4_cmd_trx (cmd, 9, rx, 4);
	
	if (rx[2] != RCB4_Ack) 
	{
		return false; // コマンド送信結果が失敗した場合はFALSEを返して処理をやめる
	}

	// ここからモーション再生終了を待ちます
	// モーション再生完了時には、システムオプションのベクタジャンプスイッチが１になるので、
	// 何度か読み込んで、１になるのを待つ
	
	while (1) // モーション再生が完了するまで50ms間隔で、システムオプションを読み出す
	{
		// RCB-4からシステムオプションを取得、データはrcb4_optに格納される
		if (rcb4_get_opt () == true) 
		{
			if (rcb4_opt.bit.b3 == 1) // ベクタジャンプが１になった→モーション再生完了
			{
				break;
			}
		}

		usleep (100000); // 100ms程度待つ（約100msごとに、データを読み込む）
	}
v
			 */
			//sendTextMsg = "";
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
				}
			} catch (error) {
				console.error('sendBye: ' + error.message);
			}
		},

		destroyBonding: function ClientModel_destroyBonding(device, restartCallback, showStartButtonsCallback) {
			if (device !== null) {
				if (device.isBonded) {
					this.client.adapter.destroyBonding(device.address, function () {
						device = null;
						restartCallback();
					}, function (error) { console.error('ClientModel_destroyBonding: ' + error); });
				} else {
					device = null;
					restartCallback();
				}
			} else {
				this.stopServerSearching();
				showStartButtonsCallback();
			}
		}

	};
}());
