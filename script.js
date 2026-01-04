class MathMatchGame {
    constructor() {
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.score = 0;
        this.moves = 0;
        this.currentLevel = null;
        this.gameMode = 'single';
        this.timeLeft = 180;
        this.timerInterval = null;
        this.maxScore = parseInt(localStorage.getItem('maxScore')) || 0;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.hints = 3;
        this.maxHints = 3;
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || [];

        // New features
        this.combo = 0;
        this.maxCombo = 0;
        this.multiplier = 1.0;
        this.bonusTime = 0;
        this.playerName = localStorage.getItem('playerName') || 'ผู้เล่น';
        this.powerUps = {
            freezeTime: 0,
            doublePoints: 0,
            showAll: 0
        };
        this.stats = JSON.parse(localStorage.getItem('stats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            totalMatches: 0
        };
        this.dailyChallengeToday = localStorage.getItem('dailyChallengeDate') !== new Date().toDateString();

        this.isPlayer1Turn = true;
        this.player2Score = 0;
        this.player2Moves = 0;

        // DOM elements
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('score');
        this.movesDisplay = document.getElementById('moves');
        this.messageDisplay = document.getElementById('message');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerDisplay = document.getElementById('timer');
        this.levelMenu = document.getElementById('levelMenu');
        this.gameInfo = document.getElementById('gameInfo');
        this.hintsDisplay = document.getElementById('hints');
        this.hintBtn = document.getElementById('hintBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.starsDisplay = document.getElementById('starsDisplay');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.leaderboardModal = document.getElementById('leaderboardModal');
        this.achievementBtn = document.getElementById('achievementBtn');
        this.achievementModal = document.getElementById('achievementModal');
        this.darkModeBtn = document.getElementById('darkModeBtn');
        this.progressFill = document.getElementById('progressFill');
        this.confetti = document.getElementById('confetti');
        this.player2Stats = document.getElementById('player2Stats');
        this.playerTurn = document.getElementById('playerTurn');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.maxScoreDisplay = document.getElementById('maxScore');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.profileBtn = document.getElementById('profileBtn');
        this.profileModal = document.getElementById('profileModal');
        this.powerUpBtn = document.getElementById('powerUpBtn');
        this.powerUpModal = document.getElementById('powerUpModal');
        this.statsBtn = document.getElementById('statsBtn');
        this.statsModal = document.getElementById('statsModal');
        this.playerNameDisplay = document.getElementById('playerName');
        this.comboDisplay = document.getElementById('combo');
        this.multiplierDisplay = document.getElementById('multiplier');
        this.bonusTimeDisplay = document.getElementById('bonusTime');

        this.maxScoreDisplay.textContent = this.maxScore;
        this.playerNameDisplay.textContent = this.playerName;
        this.init();
    }

    init() {
        this.updateSoundButton();
        this.loadDarkMode();

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.gameMode = e.target.dataset.mode;
                document.querySelectorAll('.mode-btn').forEach(b => b.style.opacity = '0.5');
                e.target.style.opacity = '1';
            });
        });

        // Level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.dataset.level));
        });

        // Game buttons
        this.resetBtn.addEventListener('click', () => this.startGame(this.currentLevel));
        this.hintBtn.addEventListener('click', () => this.useHint());
        this.soundBtn.addEventListener('click', () => this.toggleSound());
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.achievementBtn.addEventListener('click', () => this.showAchievements());
        this.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        this.profileBtn.addEventListener('click', () => this.showProfile());
        this.powerUpBtn.addEventListener('click', () => this.showPowerUps());
        this.statsBtn.addEventListener('click', () => this.showStats());
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Save name button
        const saveName = document.getElementById('saveName');
        if (saveName) {
            saveName.addEventListener('click', () => this.saveName());
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    startGame(level) {
        if (!level) {
            this.messageDisplay.textContent = '⚠️ กรุณาเลือกระดับความยาก';
            return;
        }

        this.currentLevel = level;
        this.cards = this.generateCards(level);
        this.flipped = [];
        this.matched = [];
        this.score = 0;
        this.moves = 0;
        this.combo = 0;
        this.multiplier = 1.0;
        this.bonusTime = 0;
        this.player2Score = 0;
        this.player2Moves = 0;
        this.isPlayer1Turn = true;
        this.hints = this.maxHints;

        const levelTimes = { easy: 180, medium: 120, hard: 90, extreme: 60 };
        this.timeLeft = this.gameMode === 'timed-challenge' ? 60 : this.gameMode === 'daily' ? 90 : levelTimes[level];

        this.levelMenu.style.display = 'none';
        this.gameInfo.style.display = 'grid';
        this.starsDisplay.style.display = 'none';
        this.gameBoard.style.opacity = '1';

        const levelNames = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก', extreme: 'ระเบิด' };
        this.levelDisplay.textContent = levelNames[level];

        this.player2Stats.style.display = this.gameMode === 'two-player' ? 'block' : 'none';
        this.currentPlayerDisplay.style.display = this.gameMode === 'two-player' ? 'block' : 'none';

        this.stats.gamesPlayed++;
        this.updateDisplay();
        this.updateProgress();
        this.startTimer();
        this.render();
    }

    generateCards(level) {
        const allPairs = [
            { question: '2+2', answer: '4' },
            { question: '3+5', answer: '8' },
            { question: '10-3', answer: '7' },
            { question: '2×3', answer: '6' },
            { question: '9-4', answer: '5' },
            { question: '6+6', answer: '12' },
            { question: '15÷3', answer: '5' },
            { question: '4×4', answer: '16' },
            { question: '20-8', answer: '12' },
            { question: '5×5', answer: '25' },
            { question: '100÷10', answer: '10' },
            { question: '7+8', answer: '15' },
            { question: '3×7', answer: '21' },
            { question: '30-15', answer: '15' },
            { question: '8÷2', answer: '4' },
            { question: '6×6', answer: '36' },
            { question: '9+9', answer: '18' },
            { question: '50÷5', answer: '10' },
            { question: '12-5', answer: '7' },
            { question: '11+11', answer: '22' },
        ];

        let pairs;
        if (level === 'easy') pairs = allPairs.slice(0, 8);
        else if (level === 'medium') pairs = allPairs.slice(0, 10);
        else if (level === 'hard') pairs = allPairs.slice(0, 12);
        else pairs = allPairs.slice(0, 20);

        const cards = [];
        pairs.forEach((pair, index) => {
            cards.push({ id: index, content: pair.question, type: 'question' });
            cards.push({ id: index, content: pair.answer, type: 'answer' });
        });

        return cards.sort(() => Math.random() - 0.5);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerDisplay.textContent = this.timeLeft;

            if (this.timeLeft <= 30) {
                this.timerDisplay.classList.add('warning');
            } else {
                this.timerDisplay.classList.remove('warning');
            }

            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    render() {
        this.gameBoard.innerHTML = '';
        this.cards.forEach((card, index) => {
            const cardEl = document.createElement('button');
            cardEl.className = 'card';

            const isFlipped = this.flipped.includes(index);
            const isMatched = this.matched.includes(index);

            if (isMatched) {
                cardEl.classList.add('matched');
                cardEl.textContent = card.content;
                cardEl.disabled = true;
            } else if (isFlipped) {
                cardEl.classList.add('flipped');
                cardEl.textContent = card.content;
            } else {
                cardEl.textContent = '?';
            }

            cardEl.addEventListener('click', () => this.handleCardClick(index));
            this.gameBoard.appendChild(cardEl);
        });
    }

    handleCardClick(index) {
        if (this.flipped.includes(index) || this.matched.includes(index)) return;
        if (this.flipped.length === 2) return;

        this.flipped.push(index);
        this.playSound('flip');
        this.render();

        if (this.flipped.length === 2) {
            if (this.gameMode === 'two-player') {
                this.isPlayer1Turn ? this.moves++ : this.player2Moves++;
            } else {
                this.moves++;
            }
            this.checkMatch();
        }
    }

    checkMatch() {
        const [idx1, idx2] = this.flipped;
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        if (card1.id === card2.id) {
            this.matched.push(...this.flipped);
            
            this.combo++;
            this.multiplier = 1 + (this.combo * 0.1);
            
            let points = 10 * this.multiplier;
            if (this.gameMode === 'two-player') {
                this.isPlayer1Turn ? this.score += points : this.player2Score += points;
            } else {
                this.score += points;
            }

            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }

            if (this.combo % 3 === 0 && this.combo > 0) {
                this.showComboNotification();
                this.bonusTime += 5;
                this.timeLeft += 5;
            }

            this.messageDisplay.textContent = `✅ ถูกต้อง! +${points.toFixed(0)} คะแนน`;
            this.playSound('match');
            this.flipped = [];
            this.updateDisplay();
            this.updateProgress();
            this.render();

            if (this.matched.length === this.cards.length) {
                this.endGame(true);
            }
        } else {
            this.combo = 0;
            this.multiplier = 1.0;
            this.messageDisplay.textContent = '❌ ไม่ตรงกัน';
            this.playSound('error');
            setTimeout(() => {
                if (this.gameMode === 'two-player') {
                    this.isPlayer1Turn = !this.isPlayer1Turn;
                    this.playerTurn.textContent = this.isPlayer1Turn ? 'ผู้เล่น 1' : 'ผู้เล่น 2';
                }
                this.flipped = [];
                this.render();
            }, 1000);
        }
    }

    showComboNotification() {
        const notification = document.getElementById('comboNotification');
        document.getElementById('comboCount').textContent = this.combo;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 1000);
    }

    useHint() {
        if (this.hints <= 0) {
            this.messageDisplay.textContent = '⚠️ ไม่มี Hint แล้ว';
            return;
        }

        const unmatched = this.cards
            .map((card, idx) => ({ card, idx }))
            .filter(item => !this.matched.includes(item.idx));

        if (unmatched.length < 2) return;

        const randomPair = unmatched[Math.floor(Math.random() * unmatched.length)];
        const matchingCard = unmatched.find(item => item.card.id === randomPair.card.id && item.idx !== randomPair.idx);

        if (matchingCard) {
            const cardEls = document.querySelectorAll('.card');
            cardEls[randomPair.idx].classList.add('hint');
            cardEls[matchingCard.idx].classList.add('hint');

            this.hints--;
            this.updateDisplay();
            this.messageDisplay.textContent = '💡 แนะนำ: ลองจับคู่การ์ดสองใบนี้';
            this.playSound('hint');

            setTimeout(() => {
                cardEls[randomPair.idx].classList.remove('hint');
                cardEls[matchingCard.idx].classList.remove('hint');
            }, 1500);
        }
    }

    updateProgress() {
        const progress = Math.floor((this.matched.length / this.cards.length) * 100);
        this.progressFill.style.width = progress + '%';
        document.getElementById('progress').textContent = progress;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        this.updateSoundButton();
    }

    updateSoundButton() {
        this.soundBtn.textContent = this.soundEnabled ? '🔊 เสียง' : '🔇 ปิดเสียง';
        this.soundBtn.classList.toggle('muted', !this.soundEnabled);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'true' : 'false');
    }

    loadDarkMode() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    updateDisplay() {
        this.scoreDisplay.textContent = Math.floor(this.score);
        this.movesDisplay.textContent = this.moves;
        this.hintsDisplay.textContent = this.hints;
        this.comboDisplay.textContent = this.combo;
        this.multiplierDisplay.textContent = this.multiplier.toFixed(1);
        this.bonusTimeDisplay.textContent = this.bonusTime;
        this.hintBtn.disabled = this.hints <= 0;

        if (this.gameMode === 'two-player') {
            document.getElementById('score2').textContent = Math.floor(this.player2Score);
            document.getElementById('moves2').textContent = this.player2Moves;
        }
    }

    endGame(success) {
        clearInterval(this.timerInterval);

        if (success) {
            const stars = this.calculateStars();
            this.messageDisplay.textContent = '🎉 ยินดีด้วย!';
            
            this.stats.gamesWon++;
            this.stats.totalScore += Math.floor(this.score);
            this.stats.totalMatches += this.matched.length;
            localStorage.setItem('stats', JSON.stringify(this.stats));

            if (this.gameMode === 'two-player') {
                const winner = this.score > this.player2Score ? 'ผู้เล่น 1' : this.score < this.player2Score ? 'ผู้เล่น 2' : 'เสมอ';
                this.messageDisplay.textContent += ` ${winner} ชนะ! P1: ${Math.floor(this.score)} P2: ${Math.floor(this.player2Score)}`;
            } else {
                this.messageDisplay.textContent += ` คะแนน: ${Math.floor(this.score)}`;
            }

            this.playSound('win');
            this.showStars(stars);
            this.createConfetti();

            const levelNames = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก', extreme: 'ระเบิด' };
            if (this.gameMode !== 'two-player') {
                this.addToLeaderboard(Math.floor(this.score), this.currentLevel, levelNames[this.currentLevel], stars);
                this.unlockAchievements();
            }

            if (this.score > this.maxScore) {
                this.maxScore = Math.floor(this.score);
                localStorage.setItem('maxScore', this.maxScore.toString());
                this.maxScoreDisplay.textContent = this.maxScore;
                this.messageDisplay.textContent += ' (🏆 สูงสุดใหม่!)';
            }

            if (this.gameMode === 'daily') {
                localStorage.setItem('dailyChallengeDate', new Date().toDateString());
                this.messageDisplay.textContent += ' (🎁 ได้รางวัลรายวัน!)';
            }
        } else {
            this.messageDisplay.textContent = '⏰ หมดเวลา! เกมจบ';
            this.playSound('timeout');
        }

        this.gameBoard.style.opacity = '0.5';
        document.querySelectorAll('.card').forEach(card => card.disabled = true);
    }

    calculateStars() {
        const maxTime = { easy: 180, medium: 120, hard: 90, extreme: 60 }[this.currentLevel] || 180;
        const timeUsed = maxTime - this.timeLeft;
        const efficiency = this.score / (this.moves || 1);

        if (efficiency > 3 && timeUsed < maxTime * 0.5) return 3;
        if (efficiency > 2 && timeUsed < maxTime * 0.75) return 3;
        if (efficiency > 1.5 || timeUsed < maxTime * 0.6) return 2;
        return 1;
    }

    showStars(stars) {
        let starsHtml = '';
        for (let i = 0; i < 3; i++) {
            starsHtml += i < stars ? '⭐' : '☆';
        }
        document.getElementById('stars').textContent = starsHtml;
        this.starsDisplay.style.display = 'block';
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.textContent = ['🎉', '🎊', '🎈', '⭐', '🏆'][Math.floor(Math.random() * 5)];
            piece.style.left = Math.random() * 100 + '%';
            piece.style.animationDelay = Math.random() * 0.5 + 's';
            piece.style.fontSize = (Math.random() * 20 + 20) + 'px';
            this.confetti.appendChild(piece);
        }

        setTimeout(() => {
            document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
        }, 3500);
    }

    addToLeaderboard(score, level, levelName, stars) {
        this.leaderboard.push({
            score,
            level,
            levelName,
            stars,
            date: new Date().toLocaleDateString('th-TH')
        });

        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
    }

    showLeaderboard() {
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';

        if (this.leaderboard.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีคะแนน</p>';
            this.leaderboardModal.style.display = 'flex';
            return;
        }

        this.leaderboard.forEach((item, index) => {
            const stars = '⭐'.repeat(item.stars) + '☆'.repeat(3 - item.stars);
            const html = `
                <div class="leaderboard-item">
                    <div>
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <span class="leaderboard-level">${item.levelName}</span>
                    </div>
                    <div>
                        <span>${stars}</span>
                        <span class="leaderboard-score">${item.score}</span>
                    </div>
                </div>
            `;
            list.innerHTML += html;
        });

        this.leaderboardModal.style.display = 'flex';
    }

    showProfile() {
        document.getElementById('playerNameInput').value = this.playerName;
        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <p><strong>ชื่อ:</strong> ${this.playerName}</p>
            <p><strong>เกมที่เล่น:</strong> ${this.stats.gamesPlayed}</p>
            <p><strong>เกมที่ชนะ:</strong> ${this.stats.gamesWon}</p>
            <p><strong>อัตราชนะ:</strong> ${this.stats.gamesPlayed > 0 ? ((this.stats.gamesWon / this.stats.gamesPlayed) * 100).toFixed(1) : 0}%</p>
            <p><strong>คะแนนรวม:</strong> ${this.stats.totalScore}</p>
        `;
        this.profileModal.style.display = 'flex';
    }

    saveName() {
        const name = document.getElementById('playerNameInput').value.trim();
        if (name) {
            this.playerName = name;
            localStorage.setItem('playerName', this.playerName);
            this.playerNameDisplay.textContent = this.playerName;
            this.messageDisplay.textContent = '✅ บันทึกชื่อสำเร็จ!';
            setTimeout(() => {
                this.profileModal.style.display = 'none';
            }, 1000);
        }
    }

    showPowerUps() {
        const list = document.getElementById('powerUpList');
        const powerups = [
            { id: 'freezeTime', name: 'หยุดเวลา', icon: '❄️', cost: 50 },
            { id: 'doublePoints', name: 'คะแนนสองเท่า', icon: '2️⃣', cost: 75 },
            { id: 'showAll', name: 'เปิดการ์ดทั้งหมด', icon: '👁️', cost: 100 }
        ];

        list.innerHTML = powerups.map(pup => `
            <div class="power-up-item ${this.powerUps[pup.id] <= 0 ? 'disabled' : ''}" onclick="game.activatePowerUp('${pup.id}')">
                <div class="power-up-icon">${pup.icon}</div>
                <div class="power-up-name">${pup.name}</div>
                <div class="power-up-cost">มี: ${this.powerUps[pup.id] || 0}</div>
            </div>
        `).join('');

        this.powerUpModal.style.display = 'flex';
    }

    activatePowerUp(type) {
        if (this.powerUps[type] <= 0) return;

        this.powerUps[type]--;

        switch (type) {
            case 'freezeTime':
                this.timeLeft += 30;
                this.messageDisplay.textContent = '❄️ เวลาหยุด! +30 วินาที';
                break;
            case 'doublePoints':
                this.multiplier *= 2;
                this.messageDisplay.textContent = '2️⃣ คะแนนสองเท่า!';
                break;
            case 'showAll':
                document.querySelectorAll('.card').forEach(card => {
                    const index = Array.from(document.querySelectorAll('.card')).indexOf(card);
                    card.textContent = this.cards[index].content;
                    card.classList.add('flipped');
                });
                setTimeout(() => {
                    this.render();
                }, 3000);
                this.messageDisplay.textContent = '👁️ เห็นการ์ดทั้งหมด!';
                break;
        }

        this.showPowerUps();
    }

    showStats() {
        const statsList = document.getElementById('statsList');
        const winRate = this.stats.gamesPlayed > 0 ? ((this.stats.gamesWon / this.stats.gamesPlayed) * 100).toFixed(1) : 0;
        const avgScore = this.stats.gamesWon > 0 ? (this.stats.totalScore / this.stats.gamesWon).toFixed(0) : 0;

        statsList.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">🎮 เกมที่เล่น:</span>
                <span class="stat-value">${this.stats.gamesPlayed}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🏆 เกมที่ชนะ:</span>
                <span class="stat-value">${this.stats.gamesWon}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">📊 อัตราชนะ:</span>
                <span class="stat-value">${winRate}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💯 คะแนนรวม:</span>
                <span class="stat-value">${this.stats.totalScore}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚡ คะแนนเฉลี่ย:</span>
                <span class="stat-value">${avgScore}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎯 การ์ดจับได้:</span>
                <span class="stat-value">${this.stats.totalMatches}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🔥 Combo สูงสุด:</span>
                <span class="stat-value">${this.maxCombo}</span>
            </div>
        `;

        this.statsModal.style.display = 'flex';
    }

    showAchievements() {
        const list = document.getElementById('achievementList');
        list.innerHTML = '';

        if (this.achievements.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีสัญลักษณ์</p>';
            this.achievementModal.style.display = 'flex';
            return;
        }

        this.achievements.forEach((ach) => {
            const html = `
                <div class="achievement-item">
                    <div class="achievement-icon">${ach.name.split(' ')[0]}</div>
                    <div class="achievement-text">
                        <h4>${ach.name}</h4>
                        <p>${ach.desc}</p>
                    </div>
                </div>
            `;
            list.innerHTML += html;
        });

        this.achievementModal.style.display = 'flex';
    }

    unlockAchievements() {
        const achievementList = [
            { id: 'first-win', name: '🎮 การเริ่มต้น', desc: 'ชนะเกมครั้งแรก' },
            { id: 'easy-master', name: '😊 ปรมาจารย์ง่าย', desc: 'ได้ 3 ดาวในระดับง่าย' },
            { id: 'score-100', name: '💯 สกอร์ 100', desc: 'ได้คะแนน 100 คะแนน' },
            { id: 'combo-10', name: '🔥 Combo 10', desc: 'ได้ Combo 10 ครั้ง' },
        ];

        achievementList.forEach(ach => {
            if (!this.achievements.find(a => a.id === ach.id)) {
                if (
                    (ach.id === 'first-win' && this.stats.gamesWon > 0) ||
                    (ach.id === 'easy-master' && this.leaderboard.some(item => item.levelName === 'ง่าย' && item.stars === 3)) ||
                    (ach.id === 'score-100' && this.score >= 100) ||
                    (ach.id === 'combo-10' && this.maxCombo >= 10)
                ) {
                    this.achievements.push(ach);
                }
            }
        });

        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch (type) {
                case 'flip':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'match':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                case 'error':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
                case 'hint':
                    oscillator.frequency.value = 700;
                    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.25);
                    break;
                case 'win':
                    for (let i = 0; i < 3; i++) {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = 500 + i * 200;
                        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                        osc.start(audioContext.currentTime + i * 0.1);
                        osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
                    }
                    break;
                case 'timeout':
                    oscillator.frequency.value = 150;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
            }
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
}

const game = new MathMatchGame();
