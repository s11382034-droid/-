// 劇本資料
let currentScene = "intro_1";
let currentTimeoutHandle = null; // 用來記錄當前的定時器，以便隨時停止
let isTyping = false; // 紀錄目前是否正在打字中
let currentFullText = ""; // 紀錄當前場景的完整文字
let isWalkingSoundPlaying = false; // 紀錄夫人腳步聲是否還在播放，未播完前禁止進入下一場景
// ★ 新增：紀錄玩家是否有拿黑色羽毛 (從存檔中讀取，預設為 false)
let hasBlackFeather = localStorage.getItem("has_black_feather") === "true";
let currentVoice = null; // 用來記錄目前正在播放的配音
let voiceTimeout = null; // ★ 很重要!!!：用來記錄「延遲播放的計時器」

// 用來記錄哪些樓層已經收過租了 (預設都是 false：還沒收租金)
let completedRooms = {
    "801": false,
    "701": false,
    "602": false,
    "401": false,
    "301": false,
    "202": false
};

let quizScore = 0; //用來記錄 202 夫人的問答分數

let playExperienceCount = 0; // 在401林傑瑞用來計算玩家選「我有玩過!」的次數

// ★ 修改：優先從瀏覽器讀取上一次的存檔點，若全新遊玩則預設為 null
let lastCheckpoint = localStorage.getItem("last_checkpoint") || null;

// ★ 新增：從瀏覽器儲存空間讀取已解鎖的結局紀錄（若無則為空物件）
let unlockedEndings = JSON.parse(localStorage.getItem("unlocked_endings")) || {};

//背包變數
// ★ 新增：背包是否解鎖與物品清單的存檔讀取
let isInventoryUnlocked = localStorage.getItem("inv_unlocked") === "true";
let inventoryItems = JSON.parse(localStorage.getItem("inv_items")) || [null, null, null]; 
// 預留三個空位，結構未來會是 { thumb: '小圖.png', large: '大圖.png' }

// ★ 修改：網頁載入完成後，同時檢查「結局」與「繼續遊戲」按鈕
window.addEventListener("DOMContentLoaded", () => {
    checkEndingsButton();
    checkContinueButton(); 
});

// ★ 新增：控制「繼續遊戲」按鈕是否顯示
function checkContinueButton() {
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
        // 如果有存檔紀錄，就顯示按鈕，否則隱藏
        if (lastCheckpoint) {
            continueBtn.style.display = "block";
        } else {
            continueBtn.style.display = "none";
        }
    }
}

// ★ 新增：用來控管主畫面按鈕顯示邏輯的函式
function checkEndingsButton() {
    const endingsBtn = document.getElementById("endings-btn");
    if (endingsBtn) {
        // 如果解鎖紀錄裡面有任何東西，就把按鈕顯示出來
        if (Object.keys(unlockedEndings).length > 0) {
            endingsBtn.style.display = "block";
        } else {
            endingsBtn.style.display = "none";
        }
    }
}

// --- 程式碼開頭新增變數 ---

// ★ 載入音檔:按鈕音效和開頭音樂
const clickSound = new Audio('videoplayback_Audio Trimmer.mp3');
const bgm = new Audio('OPBGM.mp3'); // 載入背景音樂
bgm.loop = true; 
bgm.volume = 0.6; // 設定初始音量 (0.0 到 1.0)

//電話鈴聲音效
const ringtoneSound = new Audio('phone_ring.mp3');

//門鈴音效
const dingdongSound = new Audio('ding_dong.mp3') ;

//開門音效
const dooropenSound = new Audio('door_open.mp3') ;

//關門音效
const doorclosedSound = new Audio('door_closed.mp3') ;

//神秘人變身音效
const strangerchangeSound = new Audio('stranger_killsound.mp3') ;

//神秘人離開音效
const strangerleaveSound = new Audio('stranger_runningaway.mp3') ;

//夫人腳步聲音效
const madamwalkingSound = new Audio('madam_coming.mp3') ;

//夫人變身音效
const madamtranSound = new Audio('madam_transfer.mp3') ;

//白凝冰尖叫音效
const mlscreamSound = new Audio('girl_screaming.mp3') ;

//男性走路音效
const malewalkingSound = new Audio('male_walking.mp3') ;

//恐怖音效
const horrorSound = new Audio('horror_soundeffect.mp3') ;

//揮刀音效
const knifeSound = new Audio('knife_slice.mp3') ;

//女性邪惡笑音效
const evillaughSound = new Audio('female_laugh.mp3') ;

//獲得or解鎖成就音效
const gotSound = new Audio('got.mp3') ;

//紙音效
const paperSound = new Audio('paper.mp3') ;

//jumpscare音效
const jumpscareSound = new Audio('jumpscare.mp3') ;



// 載入電話響完之後的日常背景音樂 1
const gameBgm = new Audio('bgmusic1.mp3'); 
gameBgm.loop = true; // 設定循環播放
gameBgm.volume = 0.5; // 設定音量

// ★ 載入到達公寓後的背景音樂 2
const gameBgm2 = new Audio('bgmusic2.mp3');
gameBgm2.loop = true; // 設定循環播放
gameBgm2.volume = 0.5; // 設定音量

const gameBgm3 = new Audio('bgmusic3.mp3');
gameBgm3.loop = true; // 設定循環播放
gameBgm3.volume = 0.5; // 設定音量

//跑步的音效
const runningSound = new Audio('running.mp3') ;

//壞結局音樂
const badendingBgm = new Audio('CallYou.mp3'); 
badendingBgm.loop = true; // 設定循環播放
badendingBgm.volume = 0.5; // 設定音量

//普通結局前面音樂
const gameBgm4 = new Audio('bgmusic4.mp3'); 
gameBgm4.loop = true; // 設定循環播放
gameBgm4.volume = 0.5; // 設定音量

// 進入801_後的音樂
const gameBgm5 = new Audio('bgmusic5.mp3');
gameBgm5.loop = true; // 設定循環播放
gameBgm5.volume = 0.5; // 設定音量

//普通結局音樂
const normalendingBgm = new Audio('normal_endingBGM.mp3'); 
normalendingBgm.loop = true; // 設定循環播放
normalendingBgm.volume = 0.5; // 設定音量

//真結局音樂
const goodendingBgm = new Audio('ending_BGM.mp3'); 
goodendingBgm.loop = true; // 設定循環播放
goodendingBgm.volume = 0.5; // 設定音量


// 解決瀏覽器自動播放限制：玩家只要點擊網頁任意地方，就啟動開頭音樂
document.addEventListener('click', () => {
    if (bgm.paused && document.getElementById("start-menu").style.display !== "none") {
        bgm.play().catch(err => console.log("音樂播放被瀏覽器阻擋:", err));
    }
});

const storyData = {
    intro_1: {
        text: "(登登登登登登登~)（咚咚咚咚咚咚咚咚咚咚~)",
        bg: "", 
        speaker: "",
        nextScene: "intro_2" 
    },
    intro_2: {
        text: "喂喂喂?",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_01.mp3",  //這句話的配音檔
        nextScene: "intro_3" 
    },
    intro_3: {
        text: "凝冰啊，最近過得如何?期末準備得怎麼樣?",
        bg: "", 
        speaker: "媽媽",
        nextScene: "intro_4" 
    },
    intro_4: {
        text: "還可以吧...",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_02.mp3",
        nextScene: "intro_5" 
    },
    intro_5: {
        text: "那就太好了!!!媽媽我有一件事要拜託你。",
        bg: "", 
        speaker: "媽媽",
        nextScene: "intro_6" 
    },
    intro_6: {
        text: "什麼事情?",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_03.mp3",
        nextScene: "intro_7" 
    },
    intro_7: {
        text: "媽媽我最近要跟你爸出國玩一下，拜託妳去公寓那裡收一下租金囉!",
        bg: "", 
        speaker: "媽媽",
        nextScene: "intro_8" 
    },
    intro_8: {
        text: "欸?啊可是我要準備期末考欸?",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_04.mp3",
        nextScene: "intro_9" 
    },
    intro_9: {
        text: "周末兩天妳排一點時間去就可以了，很快就結束了。",
        bg: "", 
        speaker: "媽媽",
        nextScene: "intro_10" 
    },
    intro_10: {
        text: "只是這樣也太突然了吧?而且最近我摩托車壞了啊!",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_05.mp3",
        nextScene: "intro_11" 
    },
    intro_11: {
        text: "就算媽媽拜託妳了，乖女兒我會幫你買禮物的!",
        bg: "", 
        speaker: "媽媽",
        nextScene: "intro_12" 
    },
    intro_12: {
        text: "好吧...",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_06.mp3",
        nextScene: "intro_13" 
    },
    intro_13: {
        text: "公寓我也好久沒去了，自從自己出來租屋後就沒有去過了。",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_07.mp3",
        nextScene: "intro_14" 
    },
    intro_14: {
        text: "不知道住戶現在都是誰呢?",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_08.mp3",
        nextScene: "intro_15" 
    },
    intro_15: {
        text: "還是先繼續學習吧，下午再說，現在外面太熱了...",
        bg: "", 
        speaker: "白凝冰",
        voice: "audio/intro_09.mp3",
        nextScene: "intro_16" 
    },
    intro_16: {
        text: "時間很快就到了黃昏...",
        bg: "", 
        speaker: "",
        nextScene: "dusk_1" 
    },
    dusk_1: {
        text: "白凝冰獨自前往公寓的路上...",
        bg: "", 
        speaker: "",
        nextScene: "dusk_2" 
    },
    dusk_2: {
        text: "好累啊!讀了一整天書，還要去收房租...",
        bg: "road_to_apt.png", 
        speaker: "白凝冰",
        nextScene: "dusk_3",
        voice: "audio/intro_10.mp3",
        delayShowText: 2000    
    },
    dusk_3: {
        text: "都已經快晚上了，走到公寓那裡還要一段路，原來走路這麼遠嗎...",
        bg: "road_to_apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_11.mp3",
        nextScene: "dusk_4"
    },
    dusk_4: {
        text: "明天還有一堆東西要用，好煩!",
        bg: "road_to_apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_12.mp3",
        nextScene: "dusk_5"
    },
    dusk_5: {
        text: "今天晚上快點收一收吧!",
        bg: "road_to_apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_13.mp3",
        nextScene: "apartment_1"
    },
    apartment_1: {
        text: "終於快到了，真的好遠。",
        bg: "apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_14.mp3",
        nextScene: "apartment_2",
        delayShowText: 2000
    },
    apartment_2: {
        text: "總感覺看起來陰森森的...",
        bg: "apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_15.mp3",
        nextScene: "apartment_3"
    },
    apartment_3: {
        text: "以前是長這樣子的嗎?",
        bg: "apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_16.mp3",
        nextScene: "apartment_4"
    },
    apartment_4: {
        text: "我應該不會遇到壞人吧...?",
        bg: "apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_17.mp3",
        nextScene: "apartment_5"
    },
    apartment_5: {
        text: "不行，再不快點我會沒時間念書!!!",
        bg: "apt.png", 
        speaker: "白凝冰",
        voice: "audio/intro_18.mp3",
        nextScene: "apartment_6"
    },
    apartment_6: {
        text: "白凝冰快速向公寓跑去...",
        bg: "apt.png", 
        speaker: "",
        nextScene: "apartment_7"
    },
    apartment_7: {
        text: "然而她不知道的是...",
        bg: "apt.png", 
        speaker: "",
        nextScene: "apartment_8"
    },
    apartment_8: {
        text: "一場危機即將來臨...",
        bg: "apt.png", 
        speaker: "",
        nextScene: "apartment_door_1",
    },
    apartment_door_1: {
        text: "白凝冰走到公寓大門口...",
        bg: "door.png", 
        speaker: "",
        nextScene: "apartment_door_2",
        delayShowText: 2000
    },
    apartment_door_2: {
        text: "此時門口前站了一人...",
        bg: "door.png", 
        speaker: "",
        nextScene: "apartment_door_3",
    },
    apartment_door_3: {
        text: "...",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_4",
    },
    apartment_door_4: {
        text: "(這個人是怎樣?怎麼擋在門口不走呀?)",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_5",
    },
    apartment_door_5: {
        text: "不好意思!我要進去裡面，可以請你借過一下嗎?",
        bg: "door.png", 
        speaker: "白凝冰",
        voice: "audio/intro_19.mp3",
        nextScene: "apartment_door_6",
    },
    apartment_door_6: {
        text: ".........",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_7",
    },
    apartment_door_7: {
        text: "............",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_8",
    },
    apartment_door_8: {
        text: "...............",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_9",
    },
    apartment_door_9: {
        text: "(有點可怕這個人，他會不會有問題?)",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_10",
    },
    apartment_door_10: {
        text: "你...",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_11",
    },
    apartment_door_11: {
        text: "!!!",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_12",
    },
    apartment_door_12: {
        text: "是!請問怎麼了?",
        bg: "door.png", 
        speaker: "白凝冰",
        voice: "audio/intro_20.mp3",
        nextScene: "apartment_door_13",
    },
    apartment_door_13: {
        text: "你...有...HUAI...嗎?",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_14",
    },
    apartment_door_14: {
        text: "欸?",
        bg: "door.png", 
        speaker: "白凝冰",
        voice: "audio/intro_21.mp3",
        nextScene: "apartment_door_15",
    },
    apartment_door_15: {
        text: "你...有訂閱...HUAI嗎?",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_16",
    },
    apartment_door_16: {
        text: "(這...我該怎麼回答?)",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_17",
        isCheckpoint: true // 這裡是一個存檔點
    },
    apartment_door_17: {
        text: "你有訂閱HUAI嗎?",
        bg: "door.png", 
        speaker: "",
        choices: [
            { text: "有，我有訂閱HUAI", nextScene: "apartment_door_18" },
            { text: "我沒有訂閱HUAI!!!", nextScene: "death_1" }
        ]
    },
    apartment_door_18: {
        text: "那...就好",
        bg: "door.png", 
        speaker: "???",
        nextScene: "apartment_door_19",
    },
    apartment_door_19: {
        text: "神秘人離開了...",
        bg: "door.png", 
        speaker: "",
        nextScene: "apartment_door_20",
    },
    apartment_door_20: {
        text: "???",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_21",
    },
    apartment_door_21: {
        text: "?????????",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_22",
    },
    apartment_door_22: {
        text: "??????????????????????????????",
        bg: "door.png", 
        speaker: "白凝冰",
        nextScene: "apartment_door_23",
    },
    apartment_door_23: {
        text: "算了...先進去再說吧!!!",
        bg: "door.png", 
        speaker: "白凝冰",
        voice: "audio/intro_22.mp3",
        nextScene: "lobby_1",
    },
    lobby_1: {
        text: "白凝冰走入了大廳",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "lobby_2",
        delayShowText: 2000
    },
    lobby_2: {
        text: "映入眼簾的是一片陰森的景象...",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "lobby_3",
    },
    lobby_3: {
        text: "一樓是白家的管理室，所以沒有租客，白家人可以使用一樓的管理室來休息。",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "lobby_4",
    },
    lobby_4: {
        text: "天啊，這裡面也太陰森了吧?",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_01.mp3",
        nextScene: "lobby_5",
    },
    lobby_5: {
        text: "我以前來的時候有這麼可怕嗎?",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_02.mp3",
        nextScene: "lobby_6",
    },
    lobby_6: {
        text: "我今天晚上居然要住這?",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_03.mp3",
        nextScene: "lobby_7",
    },
    lobby_7: {
        text: "但願等等不要發生恐怖的事情...",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_04.mp3",
        nextScene: "lobby_8",
    },
    lobby_8: {
        text: "讓我看看需要收租的有哪幾層樓...",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_05.mp3",
        nextScene: "lobby_9",
    },
    lobby_9: {
        text: "白凝冰花了幾分鐘查看...",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "lobby_10",
    },
    lobby_10: {
        text: "要收租的分別有202、301、401、602、701、801...",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "lobby_10_1",
    },
    lobby_10_1: {
        text: "咦?等等!這是什麼",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_06.mp3",
        nextScene: "lobby_10_2",
    },
    lobby_10_2: {
        text: "公寓收租守則?",
        bg: "rule.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_07.mp3",
        nextScene: "lobby_10_3",
        delayShowText: 2000
    },
    lobby_10_3: {
        text: "已獲得「公寓收租守則」，已放入右上角背包!",
        bg: "rule.png", 
        speaker: "",
        nextScene: "lobby_10_4",
    },
    lobby_10_4: {
        text: "上面寫的是什麼意思啊?",
        bg: "rule.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_08.mp3",
        nextScene: "lobby_11",
        isCheckpoint: true
    },
    lobby_11: {
        text: "只不過要收租的樓層也太多了吧!!!",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_09.mp3",
        nextScene: "lobby_12",
    },
    lobby_12: {
        text: "但也只能一鼓作氣弄完了...",
        bg: "lobby.png", 
        speaker: "白凝冰",
        voice: "audio/lobby_10.mp3",
        nextScene: "lobby_13",
    },
    lobby_13: {
        text: "說完，白凝冰便往樓梯間走...",
        bg: "lobby.png", 
        speaker: "",
        nextScene: "stair_1",
    },
    stair_1: {
        text: "這樓梯間也是夠陰森的了...這真的是人住的地方嗎?",
        bg: "stair.png", 
        speaker: "白凝冰",
        voice: "audio/stair_1.mp3",
        nextScene: "stair_1_1",
        delayShowText: 2000
    },
    stair_1_1: {
        text: "話說回來，我該從哪一間開始收起呢?",
        bg: "stair.png", 
        speaker: "白凝冰",
        voice: "audio/stair_2.mp3",
        nextScene: "stair_2",
    },
    stair_2: {
        text: "請選擇你要去的樓層!!!",
        bg: "stair.png", 
        speaker: "",
        choices: [
            // ★ 新增 roomId 標籤，讓程式能辨識這是哪個房間的選項
            { text: "801", nextScene: "801_1", roomId: "801" },
            { text: "701", nextScene: "701_1", roomId: "701" },
            { text: "602", nextScene: "602_1", roomId: "602" },
            { text: "401", nextScene: "401_1", roomId: "401" },
            { text: "301", nextScene: "301_1", roomId: "301" },
            { text: "202", nextScene: "202_1", roomId: "202" },
        ]
    },
    //房號是數字，在js語法中數字不算識別字，加上""才能強制定義數字為一串文字，從而識別!!!
    "202_1": {
        text: "白凝冰來到202...",
        bg: "door1.png", 
        speaker: "",
        nextScene: "202_2",
        delayShowText: 2000
    },
    "202_2": {
        text: "(叮咚...)",
        bg: "door1.png", 
        speaker: "",
        nextScene: "202_3",
    },
    "202_3": {
        text: "來了...",
        bg: "door1.png", 
        speaker: "一道女聲",
        nextScene: "202_4",
    },
    "202_4": {
        text: "(腳步聲...)",
        bg: "door1.png", 
        speaker: "",
        nextScene: "202_5",
    },
    "202_5": {
        text: "(喀擦...)門被打開了...",
        bg: "door1_open.png", 
        speaker: "",
        nextScene: "202_6", 
    },
    "202_6": {
        text: "映入眼簾的是一位嫵媚的女性...",
        bg: "door1_open.png", 
        speaker: "",
        nextScene: "202_7",
    },
    "202_7": {
        text: "哎呀小妹妹，妳有什麼事嗎?",
        bg: "door1_open.png", 
        speaker: "???",
        nextScene: "202_8",
    },
    "202_8": {
        text: "您好，請問該怎麼稱呼您?",
        bg: "door1_open.png", 
        speaker: "白凝冰",
        voice: "audio/202_1.mp3",
        nextScene: "202_9",
    },
    "202_9": {
        text: "妳叫我夫人就行了。",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "202_10",
    },
    "202_10": {
        text: "好的夫人!我是來收租金的。",
        bg: "door1_open.png", 
        speaker: "白凝冰",
        voice: "audio/202_2.mp3",
        nextScene: "202_11",
    },
    "202_11": {
        text: "好的~我馬上拿給妳!",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "202_12",
    },
    "202_12": {
        text: "但!在那之前...妳必須回答我幾個問題...",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "202_13",
        isCheckpoint: true // 標記這裡是一個存檔點
    },
    "202_13": {
        text: "(蛤?這麼麻煩...應該不會是什麼奇怪的問題吧?)",
        bg: "door1_open.png", 
        speaker: "白凝冰",
        nextScene: "202_14",
    },
    "202_14": {
        text: "夫人您請說!",
        bg: "door1_open.png", 
        speaker: "白凝冰",
        voice: "audio/202_3.mp3",
        nextScene: "202_15",
    },
    "202_15": {
        text: "「如果今天有一邊必須死，妳會選?」",
        bg: "door1_open.png", 
        speaker: "夫人",
        choices: [
            { text: "A. 妳的摯愛。", nextScene: "202_16" }, 
            { text: "B. 一百個無辜的人。", nextScene: "202_16", isCorrect: true},//正確答案
        ]
    },
    "202_16": {
        text: "「你面前有兩扇門，妳會選?」",
        bg: "door1_open.png", 
        speaker: "夫人",
        choices: [
            { text: "A. 門後是你最渴望得到的東西。", nextScene: "202_17",isCorrect: true },
            { text: "B. 門後是世界最需要的東西。", nextScene: "202_17", },
        ]
    },
    "202_17": {
        text: "「如果妳的摯愛成了吸血鬼，妳會選?」",
        bg: "door1_open.png", 
        speaker: "夫人",
        choices: [
            { text: "A. 舉發他。", nextScene: "202_18", },
            { text: "B. 為他殺人取血。", nextScene: "202_18",isCorrect: true },
        ]
    },
    "202_18": {
        text: "妳的回答...",
        bg: "door1_open.png", 
        speaker: "夫人",
    },// 這裡先不用寫 nextScene，因為後面程式裡有用分數動態計算！
    //新增：及格（大於等於 2 分）前往的場景
    "202_19": {
        text: "夫人微微一笑",
        bg: "door1_open.png", 
        speaker: "",
        nextScene: "202_20",
    },
    "202_20": {
        text: "真是非常的有意思。好吧，這是這一期的租金，拿去吧。",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "202_20_1",
    },
    "202_20_1": {
        text: "對了!除了301以外，其他人可能不太友善喔~",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "202_21",
    },
    "202_21": {
        text: "說完夫人便關上了門，只留下還在矇逼的白凝冰...",
        bg: "door1.png", 
        speaker: "",
        nextScene: "202_22",
    },
    "202_22": {
        text: "(剛剛那些問題是什麼意思?還有她為什麼知道我會去301?)",
        bg: "door1.png", 
        speaker: "白凝冰",
        nextScene: "202_23",
    },
    "202_23": {
        text: "算了，有收到錢就好...",
        bg: "door1.png", 
        speaker: "白凝冰",
        voice: "audio/202_4.mp3",
        nextScene: "202_24",
    },
    "202_24": {
        text: "說完，白凝冰便往樓梯間走...",
        bg: "door1.png", 
        speaker: "",
        nextScene: "stair_2",       // 拿完租金，回樓梯間
        markRoomDone: "202"        // 標記 202 已完成收租
    },
    "301_1": {
        text: "白凝冰來到301...",
        bg: "door2.png", 
        speaker: "",
        nextScene: "301_2", 
        delayShowText: 2000           
    },
    "301_2": {
        text: "這裡相比其他地方似乎更明亮了一些...",
        bg: "door2.png", 
        speaker: "",
        nextScene: "301_3",            
    },
    "301_3": {
        text: "白凝冰向門走去...",
        bg: "door2.png", 
        speaker: "",
        nextScene: "301_4",            
    },
    "301_4": {
        text: "(叮咚)...",
        bg: "door2.png", 
        speaker: "",
        nextScene: "301_5",            
    },
    "301_5": {
        text: "(腳步聲...)",
        bg: "door2.png", 
        speaker: "",
        nextScene: "301_6",            
    },
    "301_6": {
        text: "門被打開了...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_7",
        delayShowText: 2000             
    },
    "301_7": {
        text: "只見開門的是一位年輕的男性...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_8",            
    },
    "301_8": {
        text: "白凝冰?",
        bg: "door2_open.png", 
        speaker: "???",
        nextScene: "301_9",            
    },
    "301_9": {
        text: "你認識我?",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_1.mp3",
        nextScene: "301_10",            
    },
    "301_10": {
        text: "你不認識我?",
        bg: "door2_open.png", 
        speaker: "???",
        nextScene: "301_11",            
    },
    "301_11": {
        text: "沒印象...",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_2.mp3",
        nextScene: "301_12",            
    },
    "301_12": {
        text: "我是顧言啊...",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_13",            
    },
    "301_13": {
        text: "(這名字怎麼很像小說男主會有的名字...)",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        nextScene: "301_14",            
    },
    "301_14": {
        text: "好的顧言，總之我認不認識你不重要，我是來跟你收房租的!",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_3.mp3",
        nextScene: "301_15",            
    },
    "301_15": {
        text: "顧言露出沉重的表情...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_16",            
    },
    "301_16": {
        text: "好的...我這就拿給妳",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_17",            
    },
    "301_17": {
        text: "顧言轉身並回了房裡...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_18",            
    },
    "301_18": {
        text: "一段時間以後，顧言從裡面走了出來...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_19",            
    },
    "301_19": {
        text: "這裡是租金。",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_20",            
    },
    "301_20": {
        text: "感謝你的配合!那我們有緣...",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_4.mp3",
        nextScene: "301_21",            
    },
    "301_21": {
        text: "等等!!!",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_22",            
    },
    "301_22": {
        text: "這個羽毛你拿著!請將它帶在身上!",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_23",            
    },
    "301_23": {
        text: "(我該收下嗎?)",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        nextScene: "301_24",            
    },
    "301_24": {
        text: "要收下黑色的羽毛嗎?",
        bg: "door2_open.png", 
        speaker: "",
        choices: [
            { text: "收下羽毛", nextScene: "301_25", getFeather: true }, //獲得羽毛變數改成true
            { text: "拒絕收下", nextScene: "301_reject", },
        ]            
    },
    "301_reject": {
        text: "(最好還是別亂收陌生人的東西好了!)",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        nextScene: "301_reject_1",            
    },
    "301_reject_1": {
        text: "不用了謝謝!你留著就好!",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_5.mp3",
        nextScene: "301_reject_2",            
    },
    "301_reject_2": {
        text: "不行不行!拜託請妳一定要收下啊!",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_reject_3",            
    },
    "301_reject_3": {
        text: "真的不收下黑色的羽毛嗎?",
        bg: "door2_open.png", 
        speaker: "",
        choices: [
            { text: "好吧...既然你都這麼說了...", nextScene: "301_25", getFeather: true }, //獲得羽毛變數改成true
            { text: "真的不用!你自己留著就可以了!!!", nextScene: "301_reject_4", },
        ]            
    },
    "301_reject_4": {
        text: "好...",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_reject_5",            
    },
    "301_reject_5": {
        text: "那拜託妳千萬別去801!!!",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_reject_6",            
    },
    "301_reject_6": {
        text: "好我知道了!那就先這樣吧!掰掰",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_6.mp3",
        nextScene: "301_reject_7",            
    },
    "301_reject_7": {
        text: "說完白凝冰便連離開了...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "301_reject_8",            
    },
    "301_reject_8": {
        text: "只留下獨自悲傷的顧言",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "stair_2",
        markRoomDone: "301"            
    },
    "301_25": {
        text: "那我就收下囉?",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_7.mp3",
        nextScene: "301_26",            
    },
    "301_26": {
        text: "請務必帶在身上!!!",
        bg: "door2_open.png", 
        speaker: "顧言",
        nextScene: "301_27",            
    },
    "301_27": {
        text: "行...那再見了!",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        voice: "audio/301_8.mp3",
        nextScene: "301_28",            
    },
    "301_28": {
        text: "(真是奇怪的男人...)",
        bg: "door2_open.png", 
        speaker: "白凝冰",
        nextScene: "301_29",            
    },
    "301_29": {
        text: "說完白凝冰便往樓梯間走了...",
        bg: "door2_open.png", 
        speaker: "",
        nextScene: "stair_2",
        markRoomDone: "301"            
    },
    "401_1": {
        text: "白凝冰來到401...",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_2", 
        delayShowText: 2000           
    },
    "401_2": {
        text: "(叮咚)...",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_3",           
    },
    "401_3": {
        text: ".........",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_4",           
    },
    "401_4": {
        text: "..................",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_5",           
    },
    "401_5": {
        text: "....................................",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_6",           
    },
    "401_6": {
        text: "咦?奇怪?是沒有人在家嗎?",
        bg: "door3.png", 
        speaker: "白凝冰",
        voice: "audio/401_1.mp3",
        nextScene: "401_7",           
    },
    "401_7": {
        text: "正當白凝冰疑惑的時候...",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_8",           
    },
    "401_8": {
        text: "喀滋...",
        bg: "door3_open.png", 
        speaker: "",
        nextScene: "401_9",
        delayShowText: 2000           
    },
    "401_9": {
        text: "門被開了一個小縫...",
        bg: "door3_open.png", 
        speaker: "",
        nextScene: "401_10",      
    },
    "401_10": {
        text: "只見...門縫裡露出一隻眼睛盯著白凝冰...",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401_11",  
        delayShowText: 2000         
    },
    "401_11": {
        text: ".........",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401_12",           
    },
    "401_12": {
        text: "..................",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401_13",           
    },
    "401_13": {
        text: "您好?不好意思打擾了，我是來收租的!",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        voice: "audio/401_2.mp3",
        nextScene: "401_14",           
    },
    "401_14": {
        text: "............",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401_15",           
    },
    "401_15": {
        text: "(不是吧?這裡的人怎麼都那麼沒禮貌啊?)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_16",           
    },
    "401_16": {
        text: "(這樣子搞得我很尷尬欸...)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_17",           
    },
    "401_17": {
        text: "(我應該說點什麼?)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_18",           
    },
    "401_18": {
        text: "試著說點什麼...",
        bg: "door3_eye.png", 
        speaker: "",
        choices:[
            {text:"請問現在是在跟我玩什麼遊戲嗎?",nextScene:"401_19"},
            {text:"可以回應一下我嗎?", nextScene: "401choice2",},
            {text:"姑姑嘎嘎(?)",nextScene:"401choice3"},
        ],           
    },
    "401_19": {
        text: "你說遊戲嗎?",
        bg: "door3_eye.png", 
        speaker: "???",
        nextScene: "401_20",           
    },
    "401_20": {
        text: "hmm...對的...",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        voice: "audio/401_3.mp3",
        nextScene: "401_21",           
    },
    "401_21": {
        text: "太好了!我最喜歡玩遊戲了!",
        bg: "door3_eye.png", 
        speaker: "???",
        nextScene: "401_22",           
    },
    "401_22": {
        text: "啊!忘了自我介紹，我叫做林傑瑞，你也可以叫我jerryLin!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_23",           
    },
    "401_23": {
        text: "(終於願意溝通了啊!)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_24",           
    },
    "401_24": {
        text: "(只不過林傑瑞跟jerryLin不是一樣嗎?)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_25",           
    },
    "401_25": {
        text: "我的名字是白凝冰!",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        voice: "audio/401_4.mp3",
        nextScene: "401_26",           
    },
    "401_26": {
        text: "那白凝冰你有玩過暗區突圍嗎?",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_27",   
        isCheckpoint: true        
    },
    "401_27": {
        text: "你有玩過暗區突圍嗎?",
        bg: "door3_eye.png", 
        speaker: "",
        choices:[
            {text:"我有玩過!",nextScene:"401_Q1"},
            {text:"我沒有玩過!",nextScene:"401_29"},
        ],          
    },
    "401_Q1": {
        text: "那在暗區突圍中最貴的紅是什麼?",
        bg: "door3_eye.png", 
        speaker: "",
        choices:[
            {text:"那必須得是「機密文件」",nextScene:"401_28"},
            {text:"那必須得是「非洲之心」",nextScene:"401death1"},
        ],          
    },
    "401_28": {
        text: "答對!妳果然有玩過暗區!只是我還沒出過機密文件!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",   
        nextScene: "401_29",     
    },
    "401_29": {
        text: "那你有玩過CS2嗎?",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        choices:[
            {text:"我有玩過!",nextScene:"401_Q2"},
            {text:"我沒有玩過!",},
        ],              
    },
    "401_Q2": {
        text: "在CS裡，可以一發頭帶走敵人的步槍是?",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        choices:[
            {text:"那肯定是「AK-47」囉~",nextScene:"401_30"},
            {text:"那肯定是「暴徒」啊!",nextScene:"401death2"},
        ],            
    },
    "401death1": {
        text: "妳騙我!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401death1_2",           
    },
    "401death1_2": {
        text: "暗區根本就沒有非洲之心!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401death1_3",           
    },
    "401death1_3": {
        text: "你這個三角洲派來的間諜!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "death_3_1",           
    },
    "401death2": {
        text: "你騙我!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401death2_1",           
    },
    "401death2_1": {
        text: "CS2哪來的暴徒!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401death2_2",           
    },
    "401death2_2": {
        text: "妳以為我跟瓦學弟一樣好乎弄嗎?",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "death_3_1",           
    },
    "401before_death": {
        text: "妳騙我吧!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401before_death_1",           
    },
    "401before_death_1": {
        text: "這麼多遊戲沒玩!!!妳還跟我說妳有玩遊戲!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401before_death_2",           
    },
    "401before_death_2": {
        text: "我看妳只是想敷衍我!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "death_3_1",           
    },
    "401_30": {
        text: "答對!妳果然有玩過CS2!AK一發頭真的很爽!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_31",           
    },
    "401_31": {
        text: "啊!不小心一下子講太多了!妳還要收租吧?我現在拿給妳!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_32",           
    },
    "401_32": {
        text: "林傑瑞進了屋子...",
        bg: "door3_open.png", 
        speaker: "",
        nextScene: "401_33",           
    },
    "401_33": {
        text: "不久之後，他又回來了",
        bg: "door3_open.png", 
        speaker: "",
        nextScene: "401_34",           
    },
    "401_34": {
        text: "來!這裡是租金",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_35",           
    },
    "401_35": {
        text: "好的!我收到了",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        voice: "audio/401_5.mp3",
        nextScene: "401_36",           
    },
    "401_36": {
        text: "那個...",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_37",           
    },
    "401_37": {
        text: "怎麼了?",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        voice: "audio/401_6.mp3",
        nextScene: "401_38",           
    },
    "401_38": {
        text: "你如果可以的話...就不要去801收租了...",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "401_39",           
    },
    "401_39": {
        text: "說完...林傑瑞就關上了門...",
        bg: "door3.png", 
        speaker: "",
        nextScene: "401_40",           
    },
    "401_40": {
        text: "(這是什麼意思?)",
        bg: "door3.png", 
        speaker: "白凝冰",
        nextScene: "401_41",           
    },
    "401_41": {
        text: "(算了...等要去801的時候再說吧!)",
        bg: "door3.png", 
        speaker: "白凝冰",
        nextScene: "401_42",           
    },
    "401_42": {
        text: "說完，白凝冰便往樓梯走去",
        bg: "door3.png", 
        speaker: "",
        nextScene: "stair_2",     
        markRoomDone: "401"      
    },
    "401choice2": {
        text: "......",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401choice2_1",           
    },
    "401choice2_1": {
        text: "無人回應...",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401_18",           
    },
    "401choice3": {
        text: "...............",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401choice3_1",           
    },
    "401choice3_1": {
        text: "無人回應...而且非常的尷尬...",
        bg: "door3_eye.png", 
        speaker: "",
        nextScene: "401choice3_2",           
    },
    "401choice3_2": {
        text: "(我到底為什麼要說這個...)",
        bg: "door3_eye.png", 
        speaker: "白凝冰",
        nextScene: "401_18",           
    },
    "602_1": {
        text: "白凝冰來到6樓",
        bg: "door4.png", 
        speaker: "",
        nextScene: "602_2",
        delayShowText: 2000           
    },
    "602_2": {
        text: "(叮咚...)",
        bg: "door4.png", 
        speaker: "",
        nextScene: "602_3",           
    },
    "602_3": {
        text: "喀滋...幾乎在按下門鈴的瞬間，門就被打開了...",
        bg: "door4_open.png", 
        speaker: "",
        nextScene: "602_4",           
    },
    "602_4": {
        text: "出現了一位像大學生的男性...",
        bg: "door4_open.png", 
        speaker: "",
        nextScene: "602_5",           
    },
    "602_5": {
        text: "妳好!請問妳有什麼事嗎?",
        bg: "door4_open.png", 
        speaker: "???",
        nextScene: "602_6",           
    },
    "602_6": {
        text: "(這也太快了吧!)",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        nextScene: "602_7",           
    },
    "602_7": {
        text: "你好!我是來收房租的!",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        voice: "audio/602_1.mp3",
        nextScene: "602_8",           
    },
    "602_8": {
        text: "原來如此!那妳叫什麼名字?",
        bg: "door4_open.png", 
        speaker: "???",
        nextScene: "602_9",           
    },
    "602_9": {
        text: "我叫做白凝冰",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        voice: "audio/602_2.mp3",
        nextScene: "602_10",           
    },
    "602_10": {
        text: "我叫做蘭格!我可以叫妳冰冰嗎?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_11",           
    },
    "602_11": {
        text: "(這個人怎麼一上來就裝熟?)",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        nextScene: "602_12",           
    },
    "602_12": {
        text: "好的...你可以叫我冰冰...",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        voice: "audio/602_3.mp3",
        nextScene: "602_13",           
    },
    "602_13": {
        text: "太好了冰冰!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_14",           
    },
    "602_14": {
        text: "我看妳看起來也像是大學生，在拿房租以前，我可以問妳一些問題嗎?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_15",           
    },
    "602_15": {
        text: "沒問題",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        voice: "audio/602_4.mp3",
        nextScene: "602_16",           
    },
    "602_16": {
        text: "那第一題我想問...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_17", 
        isCheckpoint: true           
    },
    "602_17": {
        text: "在現實生活中妳理論上所能觀察到的最小尺度是什麼?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        choices:[
            {text:"費米",nextScene:"death_4_1"},
            {text:"0",nextScene:"death_4_1"},
            {text:"電子半徑",nextScene:"death_4_1"},
            {text:"普朗克長度",nextScene:"602_18"},
        ]           
    },
    "602_18": {
        text: "回答正確!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_19",           
    },
    "602_19": {
        text: "那第二題我想問...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_20",
        isCheckpoint: true            
    },
    "602_20": {
        text: "下列哪一種粒子不屬於費米子(Fermion)?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        choices:[
            {text:"電子",nextScene:"death_4_1"},
            {text:"光子",nextScene:"602_21"},
            {text:"質子",nextScene:"death_4_1"},
            {text:"中子",nextScene:"death_4_1"},
        ]           
    },
    "602_21": {
        text: "回答正確!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_22",           
    },
    "602_22": {
        text: "那第三題我想問...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_23", 
        isCheckpoint: true           
    },
    "602_23": {
        text: "在矽(Si)中摻入五價元素後，形成的是?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        choices:[
            {text:"P型半導體",nextScene:"death_4_1"},
            {text:"本徵半導體",nextScene:"death_4_1"},
            {text:"N型半導體",nextScene:"602_24"},
            {text:"絕緣體",nextScene:"death_4_1"},
        ]           
    },
    "602_24": {
        text: "回答正確!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_25",           
    },
    "602_25": {
        text: "那最後一題我想問...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_26", 
        isCheckpoint: true           
    },
    "602_26": {
        text: "已知一個訊號在時域為x(t)=1/πt，那它在頻域(f)時為何?",
        bg: "door4_open.png", 
        speaker: "蘭格",
        choices:[
            {text:"Sa(f/2)",nextScene:"death_4_1"},
            {text:"-πsinc²(πf)",nextScene:"death_4_1"},
            {text:"-jsgn(f)",nextScene:"602_27"},
            {text:"(1/π)rect(f/π)",nextScene:"death_4_1"},
            {text:"δ(f-π)",nextScene:"death_4_1"},
            {text:"-u²(π-f)",nextScene:"death_4_1"},
        ]           
    },
    "602_27": {
        text: "回答正確!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_28",           
    },
    "602_28": {
        text: "太厲害了!果然和冰冰妳聊天很開心",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_29",           
    },
    "602_29": {
        text: "來吧!這是房租，請收下!!!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_30",           
    },
    "602_30": {
        text: "白凝冰收下了房租",
        bg: "door4_open.png", 
        speaker: "",
        nextScene: "602_31",           
    },
    "602_31": {
        text: "對了!「001101」這個可能對妳之後有幫助喔!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "602_32",           
    },
    "602_32": {
        text: "說完，蘭格便關上了門...",
        bg: "door4.png", 
        speaker: "",
        nextScene: "602_33",           
    },
    "602_33": {
        text: "(「001101」這是什麼意思?)",
        bg: "door4.png", 
        speaker: "白凝冰",
        nextScene: "602_34",           
    },
    "602_34": {
        text: "(算了...有收到錢就好...)",
        bg: "door4.png", 
        speaker: "白凝冰",
        nextScene: "602_35",           
    },
    "602_35": {
        text: "白凝冰往樓梯走去...",
        bg: "door4.png", 
        speaker: "",
        nextScene: "stair_2",     
        markRoomDone: "602"           
    },
    "701_1": {
        text: "白凝冰到了7樓...",
        bg: "door5.png", 
        speaker: "",
        nextScene: "701_2",
        delayShowText: 2000           
    },
    "701_2": {
        text: "(叮咚...)",
        bg: "door5.png", 
        speaker: "",
        nextScene: "701_3",           
    },
    "701_3": {
        text: "喀滋...門被打開了，這開門的速度快到好像對方知道自己會來一樣...",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_4",           
    },
    "701_4": {
        text: "一位面無表情的女生走了出來...",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_5",           
    },
    "701_5": {
        text: "但這位女生，白凝冰似乎很熟悉...",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_6",           
    },
    "701_6": {
        text: "妳...有什麼事嗎?",
        bg: "door5_open.png", 
        speaker: "???",
        nextScene: "701_7",           
    },
    "701_7": {
        text: "(這個人是...柳如煙???她怎麼會在這裡?)",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        nextScene: "701_8",
        isCheckpoint: true           
    },
    "701_8": {
        text: "",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        choices:[
            {text:"我是來收租的",nextScene: "701_9"},
            {text:"妳是柳如煙對吧!我是跟妳同班的啊!妳不認得我嗎?",nextScene: "701_wrongchoice"}
        ]          
    },
    "701_9": {
        text: "好...那我拿給妳...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_10",           
    },
    "701_10": {
        text: "說完...柳如煙便進了門...",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_11",           
    },
    "701_11": {
        text: "(她真的不認得我嗎?)",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        nextScene: "701_12",           
    },
    "701_10": {
        text: "良久...柳如煙從房間走了出來...",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_11",           
    },
    "701_11": {
        text: "這是房租...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_12",           
    },
    "701_12": {
        text: "白凝冰拿過房租",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_13",           
    },
    "701_13": {
        text: "接著柳如煙便要關門",
        bg: "door5_open.png", 
        speaker: "",
        nextScene: "701_14",
        isCheckpoint: true           
    },
    "701_14": {
        text: "",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        choices:[
            {text:"那就謝謝妳了!",nextScene:"701_15"},
            {text:"柳如煙妳不認得我了?我是跟妳同班的啊!",nextScene: "701_wrongchoice"}
        ]           
    },
    "701_wrongchoice": {
        text: "我...當然認得妳...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_2",           
    },
    "701_wrongchoice_2": {
        text: "那我叫什麼名字?",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        voice: "audio/701_1.mp3",
        nextScene: "701_wrongchoice_3",           
    },
    "701_wrongchoice_3": {
        text: "妳......",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_4",           
    },
    "701_wrongchoice_4": {
        text: "妳連我叫什麼名字都不知道?",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        nextScene: "701_wrongchoice_5",           
    },
    "701_wrongchoice_5": {
        text: "妳根本不是柳如煙吧?妳到底是誰?",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        voice: "audio/701_2.mp3",
        nextScene: "701_wrongchoice_6",           
    },
    "701_wrongchoice_6": {
        text: "哈哈哈哈...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_7",           
    },
    "701_wrongchoice_7": {
        text: "妳這女人...真的很愛多管閒事欸...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_8",           
    },
    "701_wrongchoice_8": {
        text: "既然被妳發現了...",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_9",           
    },
    "701_wrongchoice_9": {
        text: "那妳就來當我的養分吧!!!",
        bg: "door5_open.png", 
        speaker: "柳如煙",
        nextScene: "701_wrongchoice_10",           
    },
    "701_wrongchoice_10": {
        text: "啊!!!",
        bg: "door5_open.png", 
        speaker: "白凝冰",
        nextScene: "ending5",           
    },
    "701_15": {
        text: "柳如煙沒有回話，而是直接關上了門...",
        bg: "door5.png", 
        speaker: "",
        nextScene: "701_16",           
    },
    "701_16": {
        text: "(她到底是怎麼了?為什麼不理我?)",
        bg: "door5.png", 
        speaker: "白凝冰",
        nextScene: "701_17",           
    },
    "701_17": {
        text: "(算了!下次在學校遇到她再問看看吧...)",
        bg: "door5.png", 
        speaker: "白凝冰",
        nextScene: "701_18",           
    },
    "701_18": {
        text: "白凝冰朝樓梯走去...",
        bg: "door5.png", 
        speaker: "",
        nextScene: "stair_2",
        markRoomDone: "701"           
    },
    // 801 條件未滿足時的「無人回應」場景
    "801_empty_1": {
        text: "白凝冰來到801",
        bg: "door6.png", 
        speaker: "",
        nextScene: "801_empty_2",
        delayShowText: 2000 
    },
    "801_empty_2": {
        text: "(叮咚)...",
        bg: "door6.png", 
        speaker: "",
        nextScene: "801_empty_3" 
    },
    "801_empty_3": {
        text: "........................",
        bg: "door6.png", 
        speaker: "",
        nextScene: "801_empty_4" 
    },
    "801_empty_4": {
        text: "奇怪，沒有人回應...難道是不在嗎？",
        bg: "door6.png", 
        speaker: "白凝冰",
        voice: "audio/801_1.mp3",
        nextScene: "801_empty_5" 
    },
    "801_empty_5": {
        text: "或許我應該先去其他樓層看看...",
        bg: "door6.png", 
        speaker: "白凝冰",
        voice: "audio/801_2.mp3",
        nextScene: "stair_2" // 沒人回應，退回樓梯間重新選擇
    },
    "801_1": {
        text: "白凝冰來到了8樓...",
        bg: "door6_open.png", 
        speaker: "",
        nextScene: "801_2" 
    },
    "801_2": {
        text: "(門怎麼開了?)",
        bg: "door6_open.png", 
        speaker: "白凝冰",
        nextScene: "801_3" 
    },
    "801_3": {
        text: "(而且這裡似乎變得更陰暗了?變得好可怕啊!)",
        bg: "door6_open.png", 
        speaker: "白凝冰",
        nextScene: "801_4" 
    },
    "801_4": {
        text: "(林傑瑞有叫我不要來這裡...難道801真的有問題?)",
        bg: "door6_open.png", 
        speaker: "白凝冰",
        nextScene: "801_5" 
    },
    "801_5": {
        text: "(我到底還要不要去收租...)",
        bg: "door6_open.png", 
        speaker: "白凝冰",
        nextScene: "801_6",
        isCheckpoint: true 
    },
    "801_6": {
        text: "你還要去收租嗎?",
        bg: "door6_open.png", 
        speaker: "",
        choices:[
            {text:"繼續收租",nextScene:"801_7"},
            {text:"先不要收好了...",nextScene:"before_normal_ending_1"}
        ] 
    },
    "801_7": {
        text: "算了，我還是進去看一下好了... ",
        bg: "door6_open.png", 
        speaker: "白凝冰",
        voice: "audio/801_3.mp3",
        nextScene: "801_8" 
    },
    "801_8": {
        text: "說完...白凝冰便往裡面走",
        bg: "door6_open.png", 
        speaker: "",
        nextScene: "801_inside" 
    },
    "801_inside": {
        text: "您好!我是來收租的!看到你門開著我就進來了",
        bg: "living_room.png", 
        speaker: "白凝冰",
        voice: "audio/801_4.mp3",
        nextScene: "801_inside_1",
        delayShowText: 2000 
    },
    "801_inside_1": {
        text: "(沒人嗎?)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_2"
    },
    "801_inside_2": {
        text: "(話說這個屋子也太空了吧!真的有人住在這裡嗎?)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_3"
    },
    "801_inside_3": {
        text: "(那裡是不是有一扇門?)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_4"
    },
    "801_inside_4": {
        text: "白凝冰往門邊走",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_5"
    },
    "801_inside_5": {
        text: "門上有一個密碼鎖...",
        bg: "door_locker_1.png", 
        speaker: "",
        nextScene: "801_inside_6",
        delayShowText: 2000
    },
    "801_inside_6": {
        text: "(這樣碰別人東西好嗎?)",
        bg: "door_locker_1.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_7"
    },
    "801_inside_7": {
        text: "(但萬一他在裡面昏倒怎麼辦?)",
        bg: "door_locker_1.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_7_1"
    },
    "801_inside_7_1": {
        text: "(只能試試看了!)",
        bg: "door_locker_1.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_7_2"
    },
    "801_inside_7_2": {
        text: "(ABCDEF，這是什麼意思?)",
        bg: "door_locker_1.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_8"
    },
    "801_inside_8": {
        text: "",
        bg: "door_locker_2.png", 
        speaker: "",
    },
    "801_inside_9": {
        text: "白凝冰進到了房間",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_inside_9_1",
        delayShowText: 2000
    },
    "801_inside_9_1": {
        text: "天啊!這些是什麼東西!!!",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        voice: "audio/801_5.mp3",
        nextScene: "801_inside_10"
    },
    "801_inside_10": {
        text: "這也太可怕了吧!這租客都在這房間幹嘛啊!",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        voice: "audio/801_6.mp3",
        nextScene: "801_inside_11"
    },
    "801_inside_11": {
        text: "此時...門外傳來一陣聲音...",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_inside_12"
    },
    "801_inside_12": {
        text: "(腳步聲...)",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_inside_13"
    },
    "801_inside_13": {
        text: "(完蛋!屋主要回來了!)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_14"
    },
    "801_inside_14": {
        text: "(被發現就糟糕了!)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        nextScene: "801_inside_15"
    },
    "801_inside_15": {
        text: "(我必須得躲起來!)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
    },
    "801_inside_choice1": {
        text: "要躲哪裡?",
        bg: "evil_room.png", 
        speaker: "",
        choices:[
            {text:"繼續躲在房間裡",nextScene:"801_before_death_1"},
            {text:"躲到門外桌子下",nextScene:"801_before_death_2"}
        ]
    },
    "801_inside_choice2": {
        text: "要躲哪裡?",
        bg: "evil_room.png", 
        speaker: "",
        choices:[
            {text:"繼續躲在房間裡",nextScene:"801_before_death_1"},
            {text:"躲到門外桌子下",nextScene:"801_before_death_2"},
            {text:"直接朝聲音方向走去!",nextScene:"801_inside_16"}
        ]
    },
    "801_inside_16": {
        text: "白凝冰朝門口走去",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_17"
    },
    "801_inside_17": {
        text: "就在此時...",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_18"
    },
    "801_inside_18": {
        text: "門開了...",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_19"
    },
    "801_inside_19": {
        text: "唉喲!居然沒有躲起來!",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_20"
    },
    "801_inside_20": {
        text: "妳是來自投羅網的吧!",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_21"
    },
    "801_inside_21": {
        text: "???說完，便朝白凝冰走去",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_22"
    },
    "801_inside_22": {
        text: "(我該如何做?)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        choices:[
            {text:"拿出黑色羽毛!!!",nextScene:"801_inside_23"},
            {text:"立刻躲進房間並鎖門!!!",nextScene:"801_death_1"},
        ]
    },
    "801_inside_23": {
        text: "白凝冰拿出黑色羽毛...",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_24"
    },
    "801_inside_24": {
        text: "這是!!!",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_25"
    },
    "801_inside_25": {
        text: "羽毛突然開始了燃燒!",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_26"
    },
    "801_inside_26": {
        text: "一道黑影顯現...",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_27"
    },
    "801_inside_27": {
        text: "顧言...?",
        bg: "living_room.png", 
        speaker: "白凝冰",
        voice: "audio/801_7.mp3",
        nextScene: "801_inside_28"
    },
    "801_inside_28": {
        text: "對!是我!我來保護妳了!",
        bg: "living_room.png", 
        speaker: "顧言",
        nextScene: "801_inside_29"
    },
    "801_inside_29": {
        text: "你和我同樣是惡魔?為什麼要幫那個人類?",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_30"
    },
    "801_inside_30": {
        text: "誰說我和你同樣了",
        bg: "living_room.png", 
        speaker: "顧言",
        nextScene: "801_inside_31"
    },
    "801_inside_31": {
        text: "我是高階惡魔，而你只是一般惡魔，你拿什麼跟我鬥?",
        bg: "living_room.png", 
        speaker: "顧言",
        nextScene: "801_inside_32"
    },
    "801_inside_32": {
        text: "看招!",
        bg: "living_room.png", 
        speaker: "顧言",
        nextScene: "801_inside_33"
    },
    "801_inside_33": {
        text: "等等!!!",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_34"
    },
    "801_inside_34": {
        text: "(刷!!!)",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_35"
    },
    "801_inside_35": {
        text: "呃啊!!!",
        bg: "living_room.png", 
        speaker: "???",
        nextScene: "801_inside_36"
    },
    "801_inside_36": {
        text: "???灰飛煙滅了...",
        bg: "living_room.png", 
        speaker: "",
        nextScene: "801_inside_37"
    },
    "801_inside_37": {
        text: "所以...這到底是發生什麼事?",
        bg: "living_room.png", 
        speaker: "白凝冰",
        voice: "audio/801_8.mp3",
        nextScene: "801_inside_38"
    },
    "801_inside_38": {
        text: "我現在馬上詳細告訴妳!",
        bg: "living_room.png", 
        speaker: "顧言",
        nextScene: "before_good_ending"
    },
    "before_good_ending": {
        text: "顧言把所有的事情都講了出來...",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_1"
    },
    "before_good_ending_1": {
        text: "原來這間公寓是因為受了剛剛那個惡魔的影響",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_2"
    },
    "before_good_ending_2": {
        text: "所以租戶才會變成這樣",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_3"
    },
    "before_good_ending_3": {
        text: "此外，顧言也幫白凝冰恢復了記憶...",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_4"
    },
    "before_good_ending_4": {
        text: "原來他們兩人在上一世是伴侶",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_5"
    },
    "before_good_ending_5": {
        text: "但...人類生命有限...白凝冰最終還是過世了",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_6"
    },
    "before_good_ending_6": {
        text: "顧言便在人世間等待白凝冰的轉世...",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_7"
    },
    "before_good_ending_7": {
        text: "這間公寓便是上一世他們相遇的地方",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_8"
    },
    "before_good_ending_8": {
        text: "回到現在......",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_9"
    },
    "before_good_ending_9": {
        text: "在經歷了這次的「公寓收租事件」以後",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_10"
    },
    "before_good_ending_10": {
        text: "顧言和白凝冰又再度成為了戀人...",
        bg: "", 
        speaker: "",
        nextScene: "before_good_ending_11"
    },
    "before_good_ending_11": {
        text: "兩人再度過上了幸福生活...",
        bg: "", 
        speaker: "",
        nextScene: "ending8"
    },
    "801_death_1": {
        text: "白冰快速跑進房間並鎖門，甚至將身體狠狠抵住門...",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_death_2"
    },
    "801_death_2": {
        text: "然而...不管過了多久，門似乎都沒有被推開的跡象...",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_death_3"
    },
    "801_death_3": {
        text: "(不然我先看看房間裡有什麼東西可以用好了!)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        nextScene: "801_death_4"
    },
    "801_death_4": {
        text: "白凝冰隨即轉頭...",
        bg: "evil_room.png", 
        speaker: "",
        nextScene: "801_before_death_2_9"
    },
    "801_before_death_1": {
        text: "(繼續躲在房間裡好了...)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        nextScene: "801_before_death_1_1"
    },
    "801_before_death_1_1": {
        text: "(希望它不要查房拜託)",
        bg: "evil_room.png", 
        speaker: "白凝冰",
        nextScene: "801_before_death_1_2"
    },
    "801_before_death_1_2": {
        text: "白凝冰害怕地閉上了眼...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_3"
    },
    "801_before_death_1_3": {
        text: "全神貫注地聽著門外的腳步聲...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_4"
    },
    "801_before_death_1_4": {
        text: "1秒...2秒...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_5"
    },
    "801_before_death_1_5": {
        text: "100秒...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_6"
    },
    "801_before_death_1_6": {
        text: "100秒過去了，白凝冰依舊沒聽到腳步聲...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_7"
    },
    "801_before_death_1_7": {
        text: "(難道他沒有進來?)",
        bg: "", 
        speaker: "白凝冰",
        nextScene: "801_before_death_1_8"
    },
    "801_before_death_1_8": {
        text: "(白凝冰決定睜開雙眼...)",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_1_9"
    },
    "801_before_death_1_9": {
        text: "找!到!妳!了!",
        bg: "catching1.png", 
        speaker: "???",
        nextScene: "801_before_death_1_10",
        delayShowText: 2000
    },
    "801_before_death_1_10": {
        text: "啊!!!!!",
        bg: "", 
        speaker: "白凝冰",
        nextScene: "ending7"
    },
    "801_before_death_2": {
        text: "(感覺躲到桌子下會是個好選擇!!!)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        nextScene: "801_before_death_2_1"
    },
    "801_before_death_2_1": {
        text: "(希望他直接往房間走...)",
        bg: "living_room.png", 
        speaker: "白凝冰",
        nextScene: "801_before_death_2_2"
    },
    "801_before_death_2_2": {
        text: "白凝冰害怕地閉上了眼...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_3"
    },
    "801_before_death_2_3": {
        text: "全神貫注地聽著門外的腳步聲...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_4"
    },
    "801_before_death_2_4": {
        text: "1秒...2秒...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_5"
    },
    "801_before_death_2_5": {
        text: "100秒...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_6"
    },
    "801_before_death_2_6": {
        text: "100秒過去了，白凝冰依舊沒聽到腳步聲...",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_7"
    },
    "801_before_death_2_7": {
        text: "(難道他沒有進來?)",
        bg: "", 
        speaker: "白凝冰",
        nextScene: "801_before_death_2_8"
    },
    "801_before_death_2_8": {
        text: "(白凝冰決定睜開雙眼...)",
        bg: "", 
        speaker: "",
        nextScene: "801_before_death_2_9"
    },
    "801_before_death_2_9": {
        text: "找!到!妳!了!",
        bg: "catching2.png", 
        speaker: "???",
        nextScene: "801_before_death_2_10",
        delayShowText: 2000
    },
    "801_before_death_2_10": {
        text: "啊!!!!!",
        bg: "", 
        speaker: "白凝冰",
        nextScene: "ending7"
    },
    "before_normal_ending_1": {
        text: "白凝冰決定先不收801了...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_2" 
    },
    "before_normal_ending_2": {
        text: "於是她便前往一樓去休息...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_3" 
    },
    "before_normal_ending_3": {
        text: "隔天一早她便離開了公寓...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_4" 
    },
    "before_normal_ending_4": {
        text: "後續她也就忘了這件事...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_5" 
    },
    "before_normal_ending_5": {
        text: "直到她母親回國後...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_6" 
    },
    "before_normal_ending_6": {
        text: "她才知道801的房客跑了...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_7" 
    },
    "before_normal_ending_7": {
        text: "而在那個房客的房間裡被警察搜出很多可怕的東西...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_8" 
    },
    "before_normal_ending_8": {
        text: "白凝冰才慶幸當初沒有進去801...",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_9" 
    },
    "before_normal_ending_9": {
        text: ".........",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_10" 
    },
    "before_normal_ending_10": {
        text: "..................",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_11" 
    },
    "before_normal_ending_11": {
        text: "這聽起來是個好結局對吧?",
        bg: "", 
        speaker: "",
        nextScene: "before_normal_ending_12" 
    },
    "before_normal_ending_12": {
        text: "但...真的是這樣嗎?",
        bg: "", 
        speaker: "",
        nextScene: "ending6" 
    },
    "death_1":{
        text:"...",
        bg: "door.png", 
        speaker: "???",
        nextScene: "death_1_1",
    },
    "death_1_1":{
        text:"............",
        bg: "door.png", 
        speaker: "???",
        nextScene: "death_1_2",
    },
    "death_1_2":{
        text:"........................",
        bg: "door.png", 
        speaker: "???",
        nextScene: "death_1_3",
    },
    "death_1_3":{
        text:"那...你去死吧!!!",
        bg: "door.png", 
        speaker: "???",
        nextScene: "death_1_4",
    },
    "death_1_4":{
        text:"欸!?",
        bg: "door.png", 
        speaker: "白凝冰",
        voice: "audio/intro_21.mp3",
        nextScene: "death_1_5",
    },
    "death_1_5":{
        text:"(刷!!!)",
        bg: "", 
        speaker: "",
        nextScene: "death_1_6",
    },
    "death_1_6":{
        text:"記得訂閱HUAI!!!",
        bg: "", 
        speaker: "",
        nextScene: "ending1",
    },
    "ending1":{
        text:"結局1:沒有訂閱HUAI",
        bg: "ending1.png", 
        speaker: "",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending2":{
        text:"結局2:晚餐",
        bg: "dinner.png", 
        speaker: "",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending3":{
        text:"結局3:欺騙",
        bg: "", 
        speaker: "ending3.png",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending4":{
        text:"結局4:實驗品",
        bg: "ending4.png", 
        speaker: "",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending5":{
        text:"結局5:不作死就不會死",
        bg: "ending5.png", 
        speaker: "",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending6":{
        text:"結局6:逃避",
        bg: "ending6.png", 
        speaker: "",
        nextScene: "normal_ending",
        delayShowText: 2000
    },
    "ending7":{
        text:"結局7:找!到!妳!了!",
        bg: "catchingyou.png", 
        speaker: "",
        nextScene: "badending_1",
        delayShowText: 2000
    },
    "ending8":{
        text:"結局8:今生也請多多指教...",
        bg: "sweet.png", 
        speaker: "",
        nextScene: "good_ending",
        delayShowText: 2000
    },
    // ★ 新增：不及格（低於 2 分）前往的死亡場景
    "death_2": {
        text: "...............",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "death_2_1"   
    },
    "death_2_1": {
        text: "真是我這輩子見過最無聊的回答...",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "death_2_2"   
    },
    "death_2_2": {
        text: "既然如此...",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "death_2_3"   
    },
    "death_2_3": {
        text: "那就當我的晚餐吧...",
        bg: "door1_open.png", 
        speaker: "夫人",
        nextScene: "death_2_4"   
    },
    "death_2_4": {
        text: "啊!!!!!!!!!!!!!!!!",
        bg: "", 
        speaker: "白凝冰",
        nextScene: "ending2"   
    },
    "death_3_1": {
        text: "既然如此...",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "death_3_2"   
    },
    "death_3_2": {
        text: "那你就去死吧!!!",
        bg: "door3_eye.png", 
        speaker: "林傑瑞",
        nextScene: "death_3_3"   
    },
    "death_3_3": {
        text: "(刷!)",
        bg: "", 
        speaker: "",
        nextScene: "ending3"   
    },
    "death_4_1": {
        text: "錯誤回答...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "death_4_2",           
    },
    "death_4_2": {
        text: "看來沒有和妳聊天的必要了...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "death_4_3",           
    },
    "death_4_3": {
        text: "既然如此...",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "death_4_4",           
    },
    "death_4_4": {
        text: "妳就來當我的實驗品吧!",
        bg: "door4_open.png", 
        speaker: "蘭格",
        nextScene: "death_4_5",           
    },
    "death_4_5": {
        text: "啊!!!!!!",
        bg: "door4_open.png", 
        speaker: "白凝冰",
        nextScene: "ending4",           
    },
    "badending_1":{
        text:"",
        bg: "bad_ending.png", 
        speaker: "",
        choices: [
            { text: "回上一存檔點" },
            { text: "重新開始", nextScene: "intro_1" },
            // ★ 修改：將文字改為中文，並加上自訂的 produces 功能標記
            { text: "回到主選單", isMainMenu: true } 
        ]
    },
    "normal_ending":{
        text:"",
        bg: "normal_ending.png", 
        speaker: "",
        choices: [
            { text: "回上一存檔點" },
            { text: "重新開始", nextScene: "intro_1" },
            { text: "回到主選單", isMainMenu: true } 
        ]
    },
    "good_ending":{
        text:"",
        bg: "sweet.png", 
        speaker: "",
        choices: [
            { text: "回上一存檔點" },
            { text: "重新開始", nextScene: "intro_1" },
            { text: "回到主選單", isMainMenu: true } 
        ]
    },
};

// 點擊「開始遊戲」
function startGame() {
    // 開始新遊戲時，重設分數與清除舊存檔
    quizScore = 0;// 確保每輪開始時都重置
    lastCheckpoint = null;
    playExperienceCount = 0; // 確保每輪開始時都重置
    localStorage.removeItem("last_checkpoint");
    playClickSound(); 
    fadeOutBGM(500); 
    document.getElementById("start-menu").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("start-menu").style.display = "none";
        document.getElementById("dialog-box").classList.remove("hidden");
        loadScene("intro_1");
    }, 500); 

    // ★ 新增：重置羽毛狀態
    hasBlackFeather = false;
    localStorage.removeItem("has_black_feather");

    // ★ 新增：重置背包紀錄
    isInventoryUnlocked = false;
    inventoryItems = [null, null, null];
    localStorage.removeItem("inv_unlocked");
    localStorage.removeItem("inv_items");
    checkInventoryBtnVisibility();
}

// 點擊「作者介紹」
function showAuthors() {
    playClickSound(); 
    document.getElementById("author-modal").classList.remove("hidden");
}

// 關閉「作者介紹」
function closeAuthors() {
    playClickSound(); 
    document.getElementById("author-modal").classList.add("hidden");
}

// ★ 新增：控制「已解鎖結局視窗」打開與關閉
function showEndings() {
    playClickSound();
    const listContainer = document.getElementById("endings-list");
    listContainer.innerHTML = ""; // 先清空舊內容

    // 動態產生結局清單
    for (let num in unlockedEndings) {
        const p = document.createElement("p");
        p.innerText = `🏆 結局 ${num} : ${unlockedEndings[num]}`;
        p.style.color = "#ff5555";
        p.style.margin = "10px 0";
        listContainer.appendChild(p);
    }
    document.getElementById("endings-modal").classList.remove("hidden");
}

function closeEndings() {
    playClickSound();
    document.getElementById("endings-modal").classList.add("hidden");
}

// ★ 新增：執行解鎖紀錄與彈出提示的核心處理函式
function unlockEnding(endingNum, endingName) {
    // 效益優化：如果這格結局之前就解鎖過了，直接跳出，不重複跑動畫與寫入
    if (unlockedEndings[endingNum]) return;

    // 寫入變數並同步存進 localStorage
    unlockedEndings[endingNum] = endingName;
    localStorage.setItem("unlocked_endings", JSON.stringify(unlockedEndings));

    // 右下角彈出提示
    const toast = document.getElementById("toast-notification");
    if (toast) {
        toast.innerText = `💥 結局 ${endingNum}: ${endingName} 已解鎖`;
        toast.classList.add("show");

        // 3.5秒後自動收回提示
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }

    // 即時更新主選單按鈕的隱藏/顯示狀態
    checkEndingsButton();
}

function loadScene(sceneKey) {
    const scene = storyData[sceneKey];
    if (!scene) return;

    // 【防呆】如果上一句的延遲計時器還在跑，立刻取消它！(防止玩家連點造成語音錯亂)
    if (voiceTimeout) {
        clearTimeout(voiceTimeout);
        voiceTimeout = null;
    }

    // 先把上一句還沒播完的配音停掉 (防止語音重疊)
    if (currentVoice && !currentVoice.paused) {
        currentVoice.pause();
        currentVoice.currentTime = 0;
    }
    
    currentScene = sceneKey;
    // ★ 新增：如果進入 801_inside_8，自動顯示密碼鎖解謎
    if (sceneKey === "801_inside_8") {
        showDoorLockPuzzle();
    } else {
        // 確保在其他場景時，解謎畫面絕對是關閉的
        const puzzleModal = document.getElementById("puzzle-modal");
        if (puzzleModal) puzzleModal.classList.add("hidden");
    }
    // ★ 新增：801_inside_15 的劇情分歧判斷
    if (sceneKey === "801_inside_15") {
        if (hasBlackFeather) {
            loadScene("801_inside_choice2"); // 有拿羽毛的路線
        } else {
            loadScene("801_inside_choice1"); // 沒拿羽毛的路線
        }
        return; // ★ 重要：直接中斷原本的載入，讓程式跳轉去新的場景
    }
    currentFullText = scene.text; 

    // 檢查這個新場景有沒有設定 voice 屬性，有的話就播放
    if (scene.voice) {
        currentVoice = new Audio(scene.voice);
        currentVoice.volume = 0.8; 

        // 檢查這個場景有沒有設定 delayShowText，沒有的話預設就是 0 (立刻播)
        let delayTime = scene.delayShowText || 0; 

        if (delayTime > 0) {
            // 如果有延遲，設定一個計時器，時間到了才播
            voiceTimeout = setTimeout(() => {
                currentVoice.play().catch(err => console.log("配音播放被阻擋:", err));
            }, delayTime);
        } else {
            // 沒有延遲，立刻播放
            currentVoice.play().catch(err => console.log("配音播放被阻擋:", err));
        }
    }

    // ★ 新增：當走到特定結局場景時，自動觸發解鎖機制
    if (sceneKey === "ending1") {
        unlockEnding("1", "沒有訂閱HUAI");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    } else if (sceneKey === "ending2") {
        unlockEnding("2", "晚餐");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending3") {
        unlockEnding("3", "欺騙");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending4") {
        unlockEnding("4", "實驗品");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending5") {
        unlockEnding("5", "不作死就不會死");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending6") {
        unlockEnding("6", "逃避");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending7") {
        unlockEnding("7", "找!到!妳!了!");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }else if (sceneKey === "ending8") {
        unlockEnding("8", "今生也請多多指教...");
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }
    

    // 新增紀錄存檔點邏輯：如果這個場景有被標記為存檔點，就把它記錄下來
    if (scene.isCheckpoint) {
        lastCheckpoint = sceneKey;
        localStorage.setItem("last_checkpoint", lastCheckpoint); // ★ 確認有加上這行，才能寫入瀏覽器記憶！
    }

    // 新增動態替換結局按鈕邏輯：如果來到壞結局，就把第一個按鈕的目的地換成剛剛記下的存檔點
    if (sceneKey === "badending_1" || sceneKey === "normal_ending" || sceneKey === "good_ending") {
        storyData["badending_1"].choices[0].nextScene = lastCheckpoint;
        storyData["normal_ending"].choices[0].nextScene = lastCheckpoint;
        storyData["good_ending"].choices[0].nextScene = lastCheckpoint;

        // 1. 強制隱藏對話框，確保按鈕位置不受干擾、完美置中
        const dialogBox = document.getElementById("dialog-box");
        if (dialogBox) {
            dialogBox.classList.add("hidden");
            dialogBox.style.display = "none"; // 直接用 style 隱藏，防止打字效果干擾
        }
    
        // 2. 進入結局場景時，強制隱藏背包按鈕
        const invBtn = document.getElementById("inventory-btn");
        if (invBtn) {
            invBtn.classList.add("hidden");
            invBtn.style.display = "none"; // 強制隱藏
        }

        // 幫遊戲加上統一的結局樣式排版 class
        document.body.classList.add("end-game-layout");

    } else {
        // ===【回到普通場景時的還原邏輯】===

        // 1. 還原對話框顯示
        const dialogBox = document.getElementById("dialog-box");
        if (dialogBox) {
            dialogBox.classList.remove("hidden");
            dialogBox.style.display = ""; // 關鍵：清除結局強加的 none
        }

        // 2. ★ 關鍵修復：清除結局時強加在背包上的行內隱藏樣式
        const invBtn = document.getElementById("inventory-btn");
        if (invBtn) {
            invBtn.style.display = ""; // 關鍵：清空行內樣式，還原給原本的 CSS 與機制控制
        }

        // 3. 重新交回給原本的函式，依據目前的存檔進度去判斷是否該顯示背包
        if (typeof checkInventoryBtnVisibility === "function") {
        checkInventoryBtnVisibility();
        }

        // 移除結局專用排版
        document.body.classList.remove("end-game-layout");
    }

    // 如果這個場景有標記「完成收租」，就把進度記下來
    if (scene.markRoomDone) {
        completedRooms[scene.markRoomDone] = true;
    }

    // ★ 新增防呆：每次重新進入 202 第一題時，分數都要重新歸零
    if (sceneKey === "202_15") {
        quizScore = 0;
    }

    // 分流：當走到 202_18 時，根據分數決定下一幕
    if (sceneKey === "202_18") {
        if (quizScore >= 2) {
            storyData["202_18"].nextScene = "202_19";    // 達到或超過 2 分 -> 活
        } else {
            storyData["202_18"].nextScene = "death_2";  // 低於 2 分 -> 死
        }
    }

    ringtoneSound.pause();
    ringtoneSound.currentTime = 0;
    madamwalkingSound.pause();
    madamwalkingSound.currentTime = 0;
    isWalkingSoundPlaying = false; // 切換場景時重置鎖定，避免音效未正常觸發 ended 而卡住

    if (sceneKey === "intro_1") {
        ringtoneSound.play().catch(err => console.log("鈴聲播放被阻擋:", err));
    }

    if (sceneKey === "intro_2" && gameBgm.paused) {
        gameBgm.play().catch(err => console.log("日常BGM播放被阻擋:", err));
    }

    // 當走到 apartment_1（公寓前）時，切換背景音樂
    if (sceneKey === "apartment_1" && gameBgm2.paused) {
        gameBgm.pause(); // 暫停原本第一首日常音樂
        gameBgm2.play().catch(err => console.log("公寓BGM2播放被阻擋:", err)); // 播放第二首音樂
    }

    if (sceneKey === "lobby_1" && gameBgm3.paused) {
        gameBgm2.pause(); // 暫停原本第一首日常音樂
        gameBgm3.play().catch(err => console.log("公寓BGM3播放被阻擋:", err)); 
    }

    if (sceneKey === "801_inside" && gameBgm5.paused) {
        gameBgm3.pause(); // 暫停原本第一首日常音樂
        gameBgm5.play().catch(err => console.log("公寓BGM5播放被阻擋:", err)); 
    }

    if (sceneKey === "before_good_ending" && goodendingBgm.paused) {
        gameBgm5.pause(); // 暫停原本第一首日常音樂
        goodendingBgm.play().catch(err => console.log("公寓BGM5播放被阻擋:", err)); 
    }

    //進入 before_normal_ending_1 時，開始播放 gameBgm4
    if (sceneKey === "before_normal_ending_1") {
        if (typeof gameBgm4 !== "undefined" && gameBgm4.paused) {
            gameBgm3.pause();
            gameBgm4.play().catch(err => console.log("gameBgm4 播放被阻擋:", err));
        }
    }

    //進入 normal_ending 時，暫停 gameBgm4，並播放 normalendingBgm
    if (sceneKey === "normal_ending") {
        if (typeof gameBgm4 !== "undefined" && !gameBgm4.paused) {
            gameBgm4.pause();
            gameBgm4.currentTime = 0;
        }
        
        if (typeof normalendingBgm !== "undefined" && normalendingBgm.paused) {
            normalendingBgm.play().catch(err => console.log("normalendingBgm 播放被阻擋:", err));
        }
    }

    //離開 normal_ending 時強制把普通結局的音樂停掉
    if (sceneKey !== "normal_ending" && typeof normalendingBgm !== "undefined" && !normalendingBgm.paused) {
        normalendingBgm.pause();
        normalendingBgm.currentTime = 0;
    }

    if (
        sceneKey !== "good_ending" && 
        sceneKey !== "ending8" && 
        !sceneKey.startsWith("before_good_ending") && 
        typeof goodendingBgm !== "undefined" && 
        !goodendingBgm.paused
    ) {
        goodendingBgm.pause();
        goodendingBgm.currentTime = 0;
    }

    if(sceneKey === "apartment_6"){
        runningSound.play().catch(err => console.log("跑步聲播放被阻擋:", err)) ;
    }

    if(sceneKey === "lobby_10_2"){
        paperSound.play().catch(err => console.log("翻紙聲播放被阻擋:", err)) ;
    }

    // ★ 新增：在 lobby_10_3 解鎖背包功能
    if (sceneKey === "lobby_10_3" && !isInventoryUnlocked) {
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
        isInventoryUnlocked = true;
        localStorage.setItem("inv_unlocked", "true");
        checkInventoryBtnVisibility(); // 立即顯示右上角按鈕
        addItemToInventory("rule_small.png", "rule_large.png", "公寓收租守則");
    }

    if (sceneKey === "301_25" ) {
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
        addItemToInventory("black_feather_small.png", "black_feather_large.png", "黑色羽毛");
    }

    if (sceneKey === "602_33" ) {
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
        addItemToInventory("number_small.png", "number_large.png", "一串數字");
    }


    if(sceneKey === "death_1_3"){
        strangerchangeSound.play().catch(err => console.log("神秘人攻擊播放被阻擋:", err)) ;
    }

    if(sceneKey === "apartment_door_19"){
        strangerleaveSound.play().catch(err => console.log("神秘人離開播放被阻擋:", err)) ;
    }

    if(sceneKey === "801_inside_9"){
        gotSound.play().catch(err => console.log("獲得或成就音效播放被阻擋:", err)) ;
    }

    if(sceneKey === "801_before_death_1_9" || sceneKey === "801_before_death_2_9"){
        jumpscareSound.play().catch(err => console.log("jumpscare音效播放被阻擋:", err)) ;
    }

    if(sceneKey === "badending_1"){
        gameBgm2.pause();
        gameBgm3.pause();
        gameBgm5.pause();
        badendingBgm.play().catch(err => console.log("BadendingBGM播放被阻擋:", err));
    }// ★ 新增以下這段：當離開壞結局時，切換回正確的音樂
    else if (!badendingBgm.paused) {
        badendingBgm.pause();       // 停止播放壞結局音樂
        badendingBgm.currentTime = 0; // 進度條歸零
        
        // 判斷如果回去的場景是公寓相關劇本，才恢復播放日常音樂 2（防止點擊「重新開始」時誤播）
        if (sceneKey.startsWith("apartment") || sceneKey.startsWith("death_")) {
            gameBgm2.play().catch(err => console.log("公寓BGM2恢復播放被阻擋:", err));
        }
        else if (sceneKey.startsWith("202") || sceneKey.startsWith("death_")) {
            gameBgm3.play().catch(err => console.log("公寓BGM3恢復播放被阻擋:", err));
        }
    }

    if(sceneKey === "202_2"|| sceneKey === "301_4" || sceneKey === "401_2" || sceneKey === "602_2" || sceneKey === "701_2" || sceneKey === "801_empty_2"){
        dingdongSound.play().catch(err => console.log("叮咚播放被阻擋:", err));
    }

    if(sceneKey === "202_4"){
        isWalkingSoundPlaying = true; // 鎖住點擊，禁止進入下一場景
        madamwalkingSound.play().catch(err => console.log("夫人腳步聲播放被阻擋:", err));
        madamwalkingSound.onended = () => {
            isWalkingSoundPlaying = false; // 音效播完，解除鎖定

            // 如果文字已經打完（finishTyping 早就跑過且當時被擋住），補上顯示箭頭
            if (!isTyping && currentScene === "202_4") {
                const nextIndicator = document.getElementById("next-indicator");
                nextIndicator.style.display = "block";
            }
        };
    }

    if(sceneKey === "202_5" || sceneKey === "301_6" || sceneKey === "401_8" || sceneKey === "602_3" || sceneKey === "701_3" || sceneKey === "801_inside_18"){
        dooropenSound.play().catch(err => console.log("開門播放被阻擋:", err));
    }

    if(sceneKey === "202_21" || sceneKey === "401_39" || sceneKey === "602_32" || sceneKey === "701_15"){
        doorclosedSound.play().catch(err => console.log("關門播放被阻擋:", err));
    }

    if(sceneKey === "death_2_3" || currentScene === "701_wrongchoice_9" || currentScene === "death_4_4"){
        isWalkingSoundPlaying = true; // 鎖住點擊，禁止進入下一場景
        madamtranSound.play().catch(err => console.log("變身播放被阻擋:", err));
        madamtranSound.onended = () => {
            isWalkingSoundPlaying = false; // 音效播完，解除鎖定

            // 如果文字已經打完（finishTyping 早就跑過且當時被擋住），補上顯示箭頭
            if (!isTyping && currentScene === "death_2_3" || currentScene === "701_wrongchoice_9") {
                const nextIndicator = document.getElementById("next-indicator");
                nextIndicator.style.display = "block";
            }
        };
    }

    if(sceneKey === "death_2_4" || sceneKey === "701_wrongchoice_10" || sceneKey === "death_4_5" || sceneKey === "801_before_death_1_10" || sceneKey === "801_before_death_2_10"){
        mlscreamSound.play().catch(err => console.log("白凝冰尖叫播放被阻擋:", err)) ;
    }
    
    if(sceneKey === "301_5" || sceneKey === "801_inside_12"){
        isWalkingSoundPlaying = true; // 鎖住點擊，禁止進入下一場景
        malewalkingSound.play().catch(err => console.log("男人腳步聲播放被阻擋:", err));
        malewalkingSound.onended = () => {
            isWalkingSoundPlaying = false; // 音效播完，解除鎖定

            // 如果文字已經打完（finishTyping 早就跑過且當時被擋住），補上顯示箭頭
            if (!isTyping && currentScene === "301_5" || sceneKey === "801_inside_12") {
                const nextIndicator = document.getElementById("next-indicator");
                nextIndicator.style.display = "block";
            }
        };
    }

    if(sceneKey === "death_1_5" || sceneKey === "death_3_3" || sceneKey === "801_inside_34"){
        isWalkingSoundPlaying = true; // 鎖住點擊，禁止進入下一場景
        knifeSound.play().catch(err => console.log("揮刀聲播放被阻擋:", err));
        knifeSound.onended = () => {
            isWalkingSoundPlaying = false; // 音效播完，解除鎖定

            // 如果文字已經打完（finishTyping 早就跑過且當時被擋住），補上顯示箭頭
            if (!isTyping && currentScene === "death_1_5" || currentScene === "death_3_3" || sceneKey === "801_inside_34") {
                const nextIndicator = document.getElementById("next-indicator");
                nextIndicator.style.display = "block";
            }
        };
    }
    if(sceneKey === "401_10"){
        horrorSound.play().catch(err => console.log("恐怖音效播放被阻擋:", err)) ;
    }


    if(sceneKey === "701_wrongchoice_6"){
        isWalkingSoundPlaying = true; // 鎖住點擊，禁止進入下一場景
        evillaughSound.play().catch(err => console.log("邪惡笑聲播放被阻擋:", err));
        evillaughSound.onended = () => {
            isWalkingSoundPlaying = false; // 音效播完，解除鎖定

            // 如果文字已經打完（finishTyping 早就跑過且當時被擋住），補上顯示箭頭
            if (!isTyping && currentScene === "701_wrongchoice_6") {
                const nextIndicator = document.getElementById("next-indicator");
                nextIndicator.style.display = "block";
            }
        };
    }

    // 回存檔點時，回復音樂
    if (sceneKey === "apartment_door_16" ) {
        if (gameBgm2.paused) {
            gameBgm2.play().catch(err => console.log("音樂恢復失敗:", err));
        }
    }
    if (sceneKey === "lobby_10_4" || sceneKey === "202_12" || sceneKey === "401_26" || sceneKey === "602_16" || sceneKey === "602_19" || sceneKey === "602_22" || sceneKey === "602_25" || sceneKey === "701_7" || sceneKey === "701_13" || sceneKey === "801_5") {
        if (gameBgm3.paused) {
            gameBgm3.play().catch(err => console.log("音樂恢復失敗:", err));
        }
    }

    // 切換全黑背景與圖片背景
    const bgImageElement = document.getElementById("bg-image");
    if (scene.bg !== "") {
        bgImageElement.style.backgroundImage = `url('images/${scene.bg}')`; 
        bgImageElement.style.backgroundColor = "transparent";
    } else {
        bgImageElement.style.backgroundImage = "none";
        bgImageElement.style.backgroundColor = "#000000"; 
    }

    document.getElementById("speaker-name").innerText = scene.speaker;
    
    const dialogTextElement = document.getElementById("dialog-text");
    const nextIndicator = document.getElementById("next-indicator");
    const choicesContainer = document.getElementById("choices-container");
    const dialogBox = document.getElementById("dialog-box");

    // 【修改核心：設定立繪相關變數與判斷】
    const charSprite = document.getElementById("character-sprite");
    let currentSpriteSrc = ""; // 準備用來記錄這一幕要顯示哪張圖片
    
    if (["apartment_door_1","apartment_door_2","apartment_door_3","apartment_door_6","apartment_door_7","apartment_door_8","apartment_door_10","apartment_door_13","apartment_door_15","apartment_door_18","death_1","death_1_1","death_1_2"].includes(sceneKey)) {
        // 顯示神秘人的圖
        currentSpriteSrc = "stranger.png"; 
    } else if (["dusk_2", "dusk_3", "dusk_4", "dusk_5"
        ,"death_1_4","apartment_door_4","apartment_door_5","apartment_door_9","apartment_door_11","apartment_door_12","apartment_door_14","apartment_door_16","apartment_door_20","apartment_door_21","apartment_door_22","apartment_door_23"
        ,"lobby_4","lobby_5","lobby_6","lobby_7","lobby_8","lobby_11","lobby_12"
        ,"202_8","202_10","202_13","202_14","202_22","202_23"
        ,"301_9","301_11","301_13","301_14","301_20","301_23","301_25","301_27","301_28"
        ,"301_reject","301_reject_1","301_reject_6"
        ,"401_6","401_13","401_15","401_16","401_17","401_20","401_23","401_24","401_25","401_35","401_37","401_40","401_41","401choice3_2"
        ,"602_6","602_7","602_9","602_11","602_12","602_15","602_33","602_34","death_4_5"
        ,"701_7","701_7","701_wrongchoice_2","701_wrongchoice_4","701_wrongchoice_5","701_wrongchoice_10","701_16","701_17"
        ,"801_inside_13","801_inside_14","801_inside_15","801_inside_23","801_inside_27","801_inside_37"
        ,"801_death_3","801_before_death_1","801_before_death_1_1","801_before_death_2","801_before_death_2_1"
        
    ].includes(sceneKey)) {
        //顯示白凝冰的立繪
        currentSpriteSrc = "ml.png"; 
    }else if (["death_1_3"].includes(sceneKey)) {
        //顯示神秘人殺人
        currentSpriteSrc = "stranger_kill.png"; 
    }else if (["202_6","202_7","202_9","202_11","202_12","202_18","202_19","202_20","202_20_1","death_2","death_2_1","death_2_2"].includes(sceneKey)) {
        //顯示夫人
        currentSpriteSrc = "madam.png"; 
    }else if (["death_2_3"].includes(sceneKey)) {
        //顯示夫人殺人
        currentSpriteSrc = "madam_kill.png"; 
    }else if (["301_7","301_8","301_10","301_12","301_15","301_16","301_19","301_21","301_22","301_26","301_reject_2","301_reject_4","301_reject_5","301_reject_8"].includes(sceneKey)) {
        //顯示顧言
        currentSpriteSrc = "lucifer.png"; 
    }else if (["602_4","602_5","602_8","602_10","602_13","602_14","602_16","602_18","602_19","602_21","602_22","602_25","602_27","602_28","602_29","602_31","death_4_1","death_4_2","death_4_3"].includes(sceneKey)) {
        //蘭格
        currentSpriteSrc = "lange.png"; 
    }else if (["death_4_4"].includes(sceneKey)) {
        //蘭格恐怖型態
        currentSpriteSrc = "lange_kill.png"; 
    }else if (["701_4","701_5","701_6","701_9","701_11","701_wrongchoice","701_wrongchoice_3","701_wrongchoice_6","701_wrongchoice_7","701_wrongchoice_8"].includes(sceneKey)) {
        //柳如煙
        currentSpriteSrc = "girl.png"; 
    }else if (["701_wrongchoice_9"].includes(sceneKey)) {
        //柳如煙寄生獸型態
        currentSpriteSrc = "girl_monster.png"; 
    }else if (["801_inside_19","801_inside_20","801_inside_21","801_inside_24","801_inside_29","801_inside_33"].includes(sceneKey)) {
        //???圖片
        currentSpriteSrc = "devil.png"; 
    }else if (["801_inside_35"].includes(sceneKey)) {
        //???被砍圖片
        currentSpriteSrc = "devil_dead.png"; 
    }else if (["801_inside_28","801_inside_30","801_inside_31","801_inside_32","801_inside_38"].includes(sceneKey)) {
        //顧言真身圖片
        currentSpriteSrc = "lucifer_demon.png"; 
    }else if (["801_inside_26"].includes(sceneKey)) {
        //顧言影子圖片
        currentSpriteSrc = "shadow.png"; 
    }

    dialogTextElement.innerText = ""; 
    nextIndicator.style.display = "none";
    choicesContainer.innerHTML = "";
    
    if (currentTimeoutHandle) {
        clearTimeout(currentTimeoutHandle);
    }

    dialogBox.style.cursor = "pointer";
    dialogBox.onclick = () => {
        if (isTyping) {
            skipTyping(dialogTextElement);
        } 
        else if (isWalkingSoundPlaying) {
            // 腳步聲還沒播完，先不切換場景（可在此加提示音或晃動效果）
            return;
        }
        else if (scene.nextScene) {
            loadScene(scene.nextScene);
        }
    };

    // 一進場時，先把立繪藏起來，避免提前露餡
    if (charSprite) {
        charSprite.classList.add("hidden");
        charSprite.src = ""; // ★ 新增這一行：先清空殘留的舊圖片，防止閃爍
    }

    // 判斷是否需要「空鏡頭」延遲顯示對話框
    if (scene.delayShowText) {
        dialogBox.classList.add("hidden"); 
        
        setTimeout(() => {
            dialogBox.classList.remove("hidden"); 
            
            // ★ 時間到，如果有設定立繪 (currentSpriteSrc 不為空)，就一起出現！
            if (charSprite && currentSpriteSrc !== "") {
                charSprite.src = currentSpriteSrc;
                charSprite.classList.remove("hidden");
            }
            
            typeWriter(dialogTextElement, scene.text, 0, 50); 
        }, scene.delayShowText); 
        
    } else {
        // ★ 修改這裡：如果是壞結局，就強制隱藏對話框；否則才正常顯示
        if (sceneKey === "badending_1" || sceneKey === "normal_ending" || sceneKey === "good_ending") {
            dialogBox.classList.add("hidden"); 
        } else {
            dialogBox.classList.remove("hidden"); 
        }
        
        // ★ 如果有設定立繪，就直接出現！
        if (charSprite && currentSpriteSrc !== "") {
            charSprite.src = currentSpriteSrc;
            charSprite.classList.remove("hidden");
        }
        
        typeWriter(dialogTextElement, scene.text, 0, 50);
    }
}

function typeWriter(element, text, index, speed) {
    isTyping = true; 

    if (index < text.length) {
        element.innerText += text.charAt(index); 
        let randomSpeed = speed + (Math.random() * 20 - 10); 

        currentTimeoutHandle = setTimeout(() => {
            typeWriter(element, text, index + 1, speed);
        }, randomSpeed);
    } else {
        finishTyping();
    }
}

function skipTyping(element) {
    if (currentTimeoutHandle) {
        clearTimeout(currentTimeoutHandle); 
    }
    element.innerText = currentFullText; 
    finishTyping();
}

function finishTyping() {
    isTyping = false; 
    const scene = storyData[currentScene];
    const nextIndicator = document.getElementById("next-indicator");
    const choicesContainer = document.getElementById("choices-container");
    const dialogBox = document.getElementById("dialog-box");

    // ★ 新增這一段：動態調整選項按鈕的位置
    if (currentScene === "badending_1"|| currentScene === "normal_ending" || currentScene === "good_ending") {
        choicesContainer.style.top = "80%"; // 壞結局時，將選項往下移 (數值 80% 可依你圖片文字的位置自由微調)
    } else {
        choicesContainer.style.top = "40%"; // 其他場景，恢復原本 CSS 設定的預設高度
    }

    if (scene.choices && scene.choices.length > 0) {
        nextIndicator.style.display = "none";
        dialogBox.style.cursor = "default";

        let renderedChoiceCount = 0; // ★ 用來計算「實際有顯示出幾個按鈕」

        scene.choices.forEach(choice => {

            //新增判斷：如果這個選項有綁定樓層，且該樓層已經完成了，就直接跳過不畫按鈕
            if (choice.roomId && completedRooms[choice.roomId]) {
                return; 
            }

            const button = document.createElement("button");
            button.innerText = choice.text;
            button.className = "menu-btn";
            
            button.onclick = () => {
                playClickSound(); 
                
                // ★ 新增：如果點擊的選項被標記為回到主選單，立刻執行對應功能並直接中斷返回
                if (choice.isMainMenu) {
                    returnToMainMenu();
                    return; 
                }

                // 如果點擊的選項有 isCorrect 標籤，分數就加 1 分
                if (choice.isCorrect) {
                    quizScore += 1;
                }

                // 1. 如果選了「我有玩過!」，計數器 +1
                if (choice.text === "我有玩過!") {
                    playExperienceCount += 1;
                }

                // 2. 特殊跳轉邏輯：401_29 的「我沒有玩過!」判斷
                if (currentScene === "401_29" && choice.text === "我沒有玩過!") {
                    if (playExperienceCount >= 1) {
                        // 只要有至少選過一次「我有玩過」，就去 401_31
                        loadScene("401_31");
                    } else {
                        // 兩次都選「沒玩過」（計數為 0），去死亡結局
                        loadScene("401before_death");
                    }
                    return; // 跳出函式，避免執行底下的 loadScene
                }

                // ★ 新增：如果這個選項有被標記為「獲得羽毛」
                if (choice.getFeather) {
                    hasBlackFeather = true; // 狀態變更為有羽毛
                    localStorage.setItem("has_black_feather", "true"); // 寫入存檔
                }

                // 條件鎖邏輯：如果玩家點擊的是 801
                if (choice.roomId === "801") {
                    // 檢查其他五個樓層是不是都已經收完租了 (true)
                    const isAllOthersDone = completedRooms["701"] && 
                                            completedRooms["602"] && 
                                            completedRooms["401"] && 
                                            completedRooms["301"] && 
                                            completedRooms["202"];
                    
                    if (!isAllOthersDone) {
                        // 如果還沒收完，強制跳轉到「無人回應」的場景，不進入真正的 801 劇情
                        loadScene("801_empty_1");
                        return; // 結束執行，不往下跑
                    }
                }
                
                // 如果是其他樓層，或是 801 的條件已經滿足，就正常進入設定好的 nextScene
                loadScene(choice.nextScene);
            };
            
            choicesContainer.appendChild(button);
            renderedChoiceCount++; // 有畫出按鈕，數量就 +1
        });

        // ★ 新增防呆機制：如果在 stair_2，且所有房間都收完租了 (沒有按鈕顯示)
        if (currentScene === "stair_2" && renderedChoiceCount === 0) {
            // 自動跳轉到所有收租完成的劇情
            loadScene("all_rent_done");
        }
    } else if (scene.nextScene) {
        // 若腳步聲還在播放（202_4），先隱藏箭頭，等音效播完才顯示
        nextIndicator.style.display = isWalkingSoundPlaying ? "none" : "block";
    } else {
        nextIndicator.style.display = "none";
        dialogBox.style.cursor = "default";
    }
}

function playClickSound() {
    clickSound.currentTime = 0; 
    clickSound.play();
}

function fadeOutBGM(duration) {
    const startVolume = bgm.volume;
    const interval = 50; 
    const step = startVolume / (duration / interval);
    
    const fadeEffect = setInterval(() => {
        if (bgm.volume > step) {
            bgm.volume -= step; 
        } else {
            bgm.volume = 0;
            bgm.pause(); 
            clearInterval(fadeEffect); 
        }
    }, interval);
}

// ★ 新增：點擊「繼續遊戲」的執行邏輯
function continueGame() {
    if (typeof playClickSound === "function") playClickSound(); // 播放點擊音效 (若有)
    
    // ★ 新增修復：暫停並淡出主選單音樂
    bgm.pause();
    fadeOutBGM(500);

    // 隱藏主選單，顯示對話框
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("dialog-box").classList.remove("hidden");
    
    checkInventoryBtnVisibility(); // ★ 新增：載入畫面後檢查是否顯示背包
    // 直接載入上一個存檔點場景
    loadScene(lastCheckpoint);
}


// ★ 修改後：點擊「回到主選單」的執行邏輯
function returnToMainMenu() {
    if (typeof playClickSound === "function") playClickSound();

    // ★ 停止還在倒數的語音計時器
    if (voiceTimeout) {
        clearTimeout(voiceTimeout);
        voiceTimeout = null;
    }

    // ★ 停止可能還在播放的角色配音
    if (currentVoice && !currentVoice.paused) {
        currentVoice.pause();
        currentVoice.currentTime = 0;
    }
    
    // ★ 新增修復：淡出並停止主選單音樂
    fadeOutBGM(500);

    // 1. 隱藏遊戲對話框，並清空當前的選項
    document.getElementById("dialog-box").classList.add("hidden");
    document.getElementById("choices-container").innerHTML = "";

    // ★ 新增修復：強制清空背景圖片，將背景變回全黑，並隱藏人物立繪
    const bgImageElement = document.getElementById("bg-image");
    if (bgImageElement) {
        bgImageElement.style.backgroundImage = "none";
        bgImageElement.style.backgroundColor = "#000000";
    }
    
    // 2. ★ 修復重點：重新顯示主選單時，必須把透明度 (opacity) 變回 1！
    const startMenu = document.getElementById("start-menu");
    startMenu.style.display = "flex"; // 配合你 CSS 原本的排版設定
    startMenu.style.opacity = "1";    // 解除隱形狀態

    // ★ 新增：停止普通結局音樂
    if (typeof normalendingBgm !== "undefined" && !normalendingBgm.paused) {
        normalendingBgm.pause();
        normalendingBgm.currentTime = 0;
    }

    if (typeof goodendingBgm !== "undefined" && !goodendingBgm.paused) {
        goodendingBgm.pause();
        goodendingBgm.currentTime = 0;
    }
    
    // 3. ★ 體驗優化：停止壞結局音樂，恢復主選單音樂
    if (typeof badendingBgm !== "undefined" && !badendingBgm.paused) {
        badendingBgm.pause();
        badendingBgm.currentTime = 0;
    }
    if (bgm.paused) {
        bgm.volume = 0.6; // 恢復被淡出的音量
        bgm.play().catch(err => console.log("主選單音樂播放被阻擋:", err));
    }

    // ★ 新增：退回主選單時，隱藏背包按鈕並關閉可能開啟的背包視窗
    checkInventoryBtnVisibility();
    document.getElementById("inventory-modal").classList.add("hidden");
    document.getElementById("item-detail-modal").classList.add("hidden");

    // 4. 更新存檔與結局按鈕的顯示狀態
    checkContinueButton();
    checkEndingsButton();
}

// ★ 新增：檢查是否該顯示右上角背包按鈕
function checkInventoryBtnVisibility() {
    const btn = document.getElementById("inventory-btn");
    if (!btn) return;
    
    // 判斷主選單是不是隱藏的 (如果在主選單就不顯示背包)
    const isMenuHidden = document.getElementById("start-menu").style.display === "none";

    // 條件：背包已解鎖 且 不在主選單
    if (isInventoryUnlocked && isMenuHidden) {
        btn.classList.remove("hidden");
    } else {
        btn.classList.add("hidden");
    }
}

// ================= 背包系統核心邏輯 =================

// 打開背包
function openInventory() {
    if (typeof playClickSound === "function") playClickSound();
    updateInventoryUI(); // 每次打開前先刷新畫面
    document.getElementById("inventory-modal").classList.remove("hidden");
}

// 關閉背包 (回到遊戲)
function closeInventory() {
    if (typeof playClickSound === "function") playClickSound();
    document.getElementById("inventory-modal").classList.add("hidden");
}

// 點擊小圖觀看大圖細節
function viewItemDetail(index) {
    const item = inventoryItems[index];
    if (!item) return; // 如果那個格子是空的，點了沒反應
    
    if (typeof playClickSound === "function") playClickSound();
    
    // 把大圖的 src 換成該物品的圖片
    document.getElementById("item-detail-img").src = item.large;
    
    // 隱藏背包，顯示詳細畫面
    document.getElementById("inventory-modal").classList.add("hidden");
    document.getElementById("item-detail-modal").classList.remove("hidden");
}

// 關閉大圖 (返回背包)
function closeItemDetail() {
    if (typeof playClickSound === "function") playClickSound();
    
    // 隱藏詳細畫面，重新顯示背包
    document.getElementById("item-detail-modal").classList.add("hidden");
    document.getElementById("inventory-modal").classList.remove("hidden");
}

// 刷新背包畫面 (把陣列裡的東西畫上去)
function updateInventoryUI() {
    const slots = document.querySelectorAll(".inv-slot");
    for (let i = 0; i < 3; i++) {
        if (inventoryItems[i]) {
            // 如果有物品，就顯示小圖
            slots[i].innerHTML = `<img src="${inventoryItems[i].thumb}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
            slots[i].style.cursor = "pointer";
        } else {
            // 如果沒物品，就清空
            slots[i].innerHTML = "";
            slots[i].style.cursor = "default";
        }
    }
}

// ★ 提供給你的工具函式：當玩家在遊戲中撿到東西時，呼叫這個就能把東西塞進背包！
// 使用範例： addItemToInventory("鑰匙小圖.png", "鑰匙大圖.png");
// ★ 修改：新增 itemName 參數，用來顯示提示文字
function addItemToInventory(thumbSrc, largeSrc, itemName) {
    for (let i = 0; i < 3; i++) {
        // 找到第一個空位放進去
        if (inventoryItems[i] === null) {
            inventoryItems[i] = { thumb: thumbSrc, large: largeSrc };
            localStorage.setItem("inv_items", JSON.stringify(inventoryItems)); // 存檔
            updateInventoryUI();
            
            // ★ 新增：右下角彈出「放入背包」提示
            const toast = document.getElementById("toast-notification");
            if (toast) {
                // 將傳入的物品名稱放進提示句型中
                toast.innerText = `🎒 ${itemName} 已放入背包`;
                toast.classList.add("show");

                // 3.5秒後自動收回提示 (與解鎖結局的頻率一致)
                setTimeout(() => {
                    toast.classList.remove("show");
                }, 3500);
            }

            return true; 
        }
    }
    console.log("背包滿了！");
    return false;
}

// ================= 密碼鎖解謎系統 (801號房) =================

// 紀錄六個按鈕的當前狀態 (false = 正常, true = 反向')
let currentLockState = [false, false, false, false, false, false];
const lockLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

// 顯示解謎畫面並生成按鈕
function showDoorLockPuzzle() {
    // 每次打開都重置狀態為全 false (ABCDEF)
    currentLockState = [false, false, false, false, false, false];
    
    const container = document.getElementById("puzzle-container");
    container.innerHTML = ""; // 清空之前的按鈕
    
    // 動態產生 6 個按鈕
    for (let i = 0; i < 6; i++) {
        let btn = document.createElement("button");
        btn.className = "lock-btn";
        btn.innerText = lockLetters[i];
        
        // 綁定點擊事件
        btn.onclick = () => toggleLockBtn(i, btn);
        container.appendChild(btn);
    }
    
    // 顯示解謎介面
    document.getElementById("puzzle-modal").classList.remove("hidden");
}

// 切換按鈕狀態
function toggleLockBtn(index, btn) {
    if (typeof playClickSound === "function") playClickSound();
    
    // 狀態反轉
    currentLockState[index] = !currentLockState[index];
    
    // 更新外觀與文字
    if (currentLockState[index]) {
        btn.innerText = lockLetters[index] + "'"; // 加上單引號表示反向
        btn.classList.add("toggled");
    } else {
        btn.innerText = lockLetters[index]; // 恢復正常
        btn.classList.remove("toggled");
    }
    
    // 每次按鈕按完，檢查是否過關
    checkLockPuzzle();
}

// 檢查是否符合 001101 (A' B' C D E' F) 的過關條件
function checkLockPuzzle() {
    // 目標狀態：A'(true), B'(true), C(false), D(false), E'(true), F(false)
    const targetState = [true, true, false, false, true, false];
    
    let isCorrect = true;
    for (let i = 0; i < 6; i++) {
        if (currentLockState[i] !== targetState[i]) {
            isCorrect = false;
            break; // 只要有一個不對就跳出檢查
        }
    }
    
    // 如果全部答對
    if (isCorrect) {
        // 為了讓玩家有「按下去確認」的爽感，稍微延遲 0.6 秒再換場
        setTimeout(() => {
            // 隱藏機關畫面
            document.getElementById("puzzle-modal").classList.add("hidden");
            
            // 自動推進劇情到成功開門的畫面
            loadScene("801_inside_9");
        }, 600);
    }
}