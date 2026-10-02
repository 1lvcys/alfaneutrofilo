const input = document.getElementById("text-input");
const result = document.getElementById("result");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const alphabet = document.getElementById("alphabet");

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Remove acentos para que Á, Ã, Ç etc. possam usar o alfabeto disponível.
function normalizeText(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
}

function imagePath(letter) {
    return `fotos/letras/${letter.toLowerCase()}.png`;
}

function generate() {
    const original = input.value.trim();

    if (!original) {
        result.innerHTML = '<p class="empty">Digite alguma coisa primeiro 💜</p>';
        downloadBtn.disabled = true;
        return;
    }

    const text = normalizeText(original);
    result.innerHTML = "";

    for (const char of text) {
        if (char === " ") {
            const space = document.createElement("span");
            space.className = "space";
            result.appendChild(space);
            continue;
        }

        if (letters.includes(char)) {
            const img = document.createElement("img");
            img.className = "neutro";
            img.src = imagePath(char);
            img.alt = `Neutrófilo representando a letra ${char}`;
            img.title = char;
            result.appendChild(img);
        } else {
            // Mantém números e símbolos que não existem no alfabeto.
            const unknown = document.createElement("span");
            unknown.className = "unknown";
            unknown.textContent = char;
            unknown.title = "Não existe uma célula correspondente a este símbolo.";
            result.appendChild(unknown);
        }
    }

    downloadBtn.disabled = false;
}

function clearAll() {
    input.value = "";
    result.innerHTML = '<p class="empty">Sua frase aparecerá aqui 💜</p>';
    downloadBtn.disabled = true;
    input.focus();
}

// Mostra o alfabeto completo.
letters.split("").forEach(letter => {
    const card = document.createElement("div");
    card.className = "letter-card";
    card.innerHTML = `
        <img src="${imagePath(letter)}" alt="Letra ${letter}">
        <strong>${letter}</strong>
    `;
    alphabet.appendChild(card);
});

generateBtn.addEventListener("click", generate);
clearBtn.addEventListener("click", clearAll);

input.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        generate();
    }
});

/*
 * Gera uma imagem PNG simples do resultado.
 * Para isso, desenhamos os neutrófilos em um canvas.
 */
downloadBtn.addEventListener("click", async () => {
    const imgs = [...result.querySelectorAll("img")];

    if (!imgs.length) return;

    const scale = 2;
    const cellSize = 82;
    const gap = 5;
    const maxWidth = 1000;
    const charsPerLine = Math.max(1, Math.floor((maxWidth + gap) / (cellSize + gap)));

    const canvas = document.createElement("canvas");
    const rows = Math.ceil(imgs.length / charsPerLine);

    canvas.width = maxWidth * scale;
    canvas.height = Math.max(130, rows * (cellSize + gap) + 45) * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    ctx.fillStyle = "#faf8fc";
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

    ctx.fillStyle = "#56358c";
    ctx.font = "600 18px Poppins, Arial";
    ctx.fillText("Alfabeto de Neutrófilos", 20, 28);

    for (let i = 0; i < imgs.length; i++) {
        const row = Math.floor(i / charsPerLine);
        const col = i % charsPerLine;
        const x = 20 + col * (cellSize + gap);
        const y = 42 + row * (cellSize + gap);

        const image = new Image();
        image.src = imgs[i].src;

        await new Promise(resolve => {
            if (image.complete) resolve();
            else image.onload = resolve;
        });

        ctx.drawImage(image, x, y, cellSize, cellSize);
    }

    const link = document.createElement("a");
    link.download = "frase-em-neutrofilos.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
