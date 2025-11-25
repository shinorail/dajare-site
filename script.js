// ----------------------------------
// JavaScript: データ取得とフィルタリング
// ----------------------------------

// 【重要】スプレッドシートのCSV公開URLに置き換えてください。
// 前回ご提示いただいたURLを仮にプレースホルダーとして使用します。
const SPREADSHEET_URL = "[ここに スプレッドシートのCSV公開URL を貼り付けます]";

// 🚫 不適切な単語を自動で非表示にするためのNGワードリスト
const NG_WORDS = ['死ね', 'バカ', '暴言', '不適切']; 

let allPuns = []; // 読み込んだ全ダジャレデータを保存する配列

// --- 投稿ボタンの機能 ---
const POST_FORM_URL = "https://forms.gle/TauBd2Ffpd1HG44r8"; // 指定されたGoogleフォームのURL
const postButton = document.getElementById('post-button');

// ボタンがクリックされたら、新しいウィンドウでフォームを開く
if (postButton) {
    postButton.addEventListener('click', () => {
        window.open(POST_FORM_URL, '_blank');
    });
}
// ------------------------


// スプレッドシートからデータを取得し、整形して表示する関数
async function fetchAndDisplayPuns() {
    const container = document.getElementById('pun-list');
    container.innerHTML = 'データを読み込み中です...';

    try {
        const response = await fetch(SPREADSHEET_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const csvText = await response.text();

        const rows = csvText.trim().split('\n').slice(1);
        
        allPuns = rows.reverse().map(row => { 
            const columns = row.split(',');
            // 列順: タイムスタンプ(0), ダジャレ(1), ハンドルネーム(2), カテゴリ(3)
            const timestamp = columns[0].trim();
            const punText = columns[1].trim(); 
            const author = columns[2] ? columns[2].trim() : '名無し'; 
            const category = columns[3] ? columns[3].trim() : '未分類'; 

            const isAppropriate = !NG_WORDS.some(ngWord => punText.includes(ngWord));

            if (isAppropriate) {
                return { timestamp, punText, author, category };
            }
            return null; 
        }).filter(pun => pun !== null);


        createCategoryTabs(allPuns);
        displayPuns(allPuns);

    } catch (error) {
        console.error("データの取得中にエラーが発生しました:", error);
        container.innerHTML = '<p style="color: red;">データの読み込みに失敗しました。URLと公開設定を確認してください。</p>';
    }
}

// カテゴリタブを生成する関数
function createCategoryTabs(puns) {
    // ... (前回のコードと同じ内容) ...
    const tabContainer = document.getElementById('tab-container');
    tabContainer.innerHTML = '';
    
    const categories = new Set(puns.map(p => p.category));
    
    // 「すべて」タブの追加
    let allButton = document.createElement('button');
    allButton.textContent = 'すべて';
    allButton.className = 'tab-button active';
    allButton.addEventListener('click', () => filterAndDisplay('すべて'));
    tabContainer.appendChild(allButton);

    // 各カテゴリのタブを追加
    categories.forEach(category => {
        let button = document.createElement('button');
        button.textContent = category;
        button.className = 'tab-button';
        button.addEventListener('click', () => filterAndDisplay(category));
        tabContainer.appendChild(button);
    });
}

// 指定されたカテゴリでフィルタリングして表示を更新する関数
function filterAndDisplay(selectedCategory) {
    // ... (前回のコードと同じ内容) ...
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === selectedCategory) {
            btn.classList.add('active');
        }
    });

    let filteredPuns;
    if (selectedCategory === 'すべて') {
        filteredPuns = allPuns;
    } else {
        filteredPuns = allPuns.filter(pun => pun.category === selectedCategory);
    }

    displayPuns(filteredPuns);
}


// 実際にダジャレをHTMLに表示する関数
function displayPuns(puns) {
    // ... (前回のコードと同じ内容) ...
    const container = document.getElementById('pun-list');
    let htmlContent = '';
    
    if (puns.length === 0) {
        container.innerHTML = '<p>表示できるダジャレはありません。</p>';
        return;
    }

    puns.forEach(pun => {
        htmlContent += `
            <div class="pun-item">
                <div class="pun-text">${pun.punText}</div>
                <div class="pun-author">
                    - ${pun.author} (${pun.timestamp.substring(0, 10)}) / ${pun.category}
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

// ページが読み込まれたら初期データを取得・表示
fetchAndDisplayPuns();
