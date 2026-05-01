// Global state and variables
let peer = null;
let conn = null;
let isHost = false;
let isSolo = false;

let myName = '';
let opponentName = '';
let myChar = 'ladybug';
let opponentChar = 'catnoir';

let questions = [];
let currentQIndex = 0;
let p1Score = 0;
let p2Score = 0;

let p1Answer = null;
let p2Answer = null;
let isRevealed = false;
let streak = 0;
let highestStreak = 0;
let nextTimer = null;
let myMistakes = [];

// Hardcoded manifest fallback
const PRELOADED_QUIZZES = [
    "dbms.json",
    "currentQuizzes/UTS SET 1 SPIRITUAL.txt",
    "currentQuizzes/UTS SET 2 POLITICS TO MATERIAL.txt",
    "currentQuizzes/DA SET 1.txt",
    "currentQuizzes/DA TYPE12 TEST.txt",
    "currentQuizzes/DA IV DV AND TEST.txt"
];

// DOM Elements cache
const screens = document.querySelectorAll('.screen');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoomBtn = document.getElementById('btn-join-room');
const playerNameInput = document.getElementById('player-name-input');
const hostRoomCode = document.getElementById('host-room-code');
const fileDropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('file-input');
const dropLabel = document.getElementById('drop-label');
const hostStatus = document.getElementById('host-status');
const soloStatus = document.getElementById('solo-status');
const btnStartGame = document.getElementById('btn-start-game');
const joinRoomInput = document.getElementById('join-room-input');
const btnConnect = document.getElementById('btn-connect');
const joinStatus = document.getElementById('join-status');
const statP1 = document.getElementById('stat-p1');
const statP2 = document.getElementById('stat-p2');
const nameP1 = document.getElementById('name-p1');
const nameP2 = document.getElementById('name-p2');
const avatarP1 = document.getElementById('avatar-p1');
const avatarP2 = document.getElementById('avatar-p2');
const scoreP1 = document.getElementById('score-p1');
const scoreP2 = document.getElementById('score-p2');
const questionText = document.getElementById('question-text');
const choicesGrid = document.getElementById('choices-grid');
const battleMsg = document.getElementById('battle-msg');
const btnNextQ = document.getElementById('btn-next-q');
const winnerText = document.getElementById('winner-text');
const finalNameP1 = document.getElementById('final-name-p1');
const finalNameP2 = document.getElementById('final-name-p2');
const finalP1 = document.getElementById('final-p1');
const finalP2 = document.getElementById('final-p2');
const btnHome = document.getElementById('btn-home');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');
const btnSoloMode = document.getElementById('btn-solo-mode');
const soloFileDropZone = document.getElementById('solo-file-drop-zone');
const soloFileInput = document.getElementById('solo-file-input');
const soloDropLabel = document.getElementById('solo-drop-label');
const btnStartSolo = document.getElementById('btn-start-solo');
const btnRetryMistakes = document.getElementById('btn-retry-mistakes');
const themeToggle = document.getElementById('theme-toggle');
const bgmSelect = document.getElementById('bgm-select');
const bgmVolume = document.getElementById('bgm-volume');
const musicPlayerUI = document.getElementById('music-player');
