function Game() {
    this.width = 40;
    this.height = 24;
    this.map = []; // Инфа о каждой клетке
    this.playerX = null;
    this.playerY = null;
    this.hasSword = false; // Подбор меча

    // Функция генерации карты (заполнение пространства стенами по ширине и высоте)
    this.generateMap = function () {
        for (let y = 0; y < this.height; y++) {
            this.map[y] = []
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = {type: "W"}
            }
        }
    }

    // Функция проверки области
    this.isAreaEmpty = function (x, y, w, h) {

        //Проходимся по всей области комнаты и по периметру, чтобы максимальное приближение комнат было на 1 кл друг от друга ([dy, dx] = -1).
        for (let dy = -1; dy <= h; dy++) {
            for (let dx = -1; dx <= w; dx++) {

                let rx = x + dx, ry = y + dy // координата, которую проверяем

                // Если клетка выходит за границы
                if (ry < 0 || ry >= this.height || rx < 0 || rx >= this.width) continue

                // Если клетка занята клеткой комнаты
                if (this.map[ry][rx].type === "") return false
            }
        }
        return true
    }

    // Функция генерации комнат
    this.generateRooms = function () {

        let roomCount = 5 + Math.floor(Math.random() * 6) // Количество комнат

        let tries = 0, created = 0 // Счетчик попыток генерации комнат
        // (чтобы не пересекались, и чтобы ограничить кол-во неуд. попыток)

        while( created < roomCount && tries < 1000) {

            tries++

            let w = 3 + Math.floor(Math.random() * 6) // Случайная ширина
            let h = 3 + Math.floor(Math.random() * 6) // Случайная высота

            let lx = Math.floor(Math.random() * (this.width - w - 1)) // Случайная координата (верх.лев.угол)
            let ly = Math.floor(Math.random() * (this.height - h - 1)) // Случайная координата (верх.лев.угол)

            // Проверка наложения комнат друг на друга
            if (this.isAreaEmpty(lx, ly, w, h)) {
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        this.map[ly + y][lx + x].type = ''
                    }
                }
                created++
            }
        }
    }

    // Функция для генерации проходов
    this.generatePassages = function () {
        let vertic = 3 + Math.floor(Math.random() * 2)
        let horis = 3 + Math.floor(Math.random() * 2)

        // вертекальные проходы
        for (let i = 0; i < vertic; i++) {
            let x = Math.floor(Math.random() * this.width)
            for (let y = 0; y < this.height; y++) this.map[y][x].type = ""
        }

        // горизонтальные проходы
        for (let i = 0; i < horis; i++) {
            let y = Math.floor(Math.random() * this.height)
            for (let x = 0; x < this.width; x++) this.map[y][x].type = ""
        }
    }

    // Функция для размещения объектов по карте (вспомогательная)
    this.placeObj = function (type, count, props = {}){
        let placed = 0;
        while (placed < count) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            let tile = this.map[y][x];
            if (tile.type === "") {
                this.map[y][x] = { type, ...props };
                placed++;
            }
        }
    }

    // Функция генерации зелий и мечей
    this.generateItems = function () {
        this.placeObj("HP", 10)
        this.placeObj("SW", 2)
    }

    // Функция генерации врагов
    this.generateEnemies = function () {
        this.placeObj("E", 10, { hp: 5, maxHp: 5 });
    }

    // Функция для передвижения врагов. Случайное патулирование и преследование
    this.moveEnemy = function () {
        const visionRadius = 5

        let enemies =[] // Текущие позиции врагов, чтобы они не сталкивались
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tile = this.map[y][x];
                if (tile.type === "E") enemies.push({ x, y, hp: tile.hp, maxHp: tile.maxHp });
            }
        }

        enemies.forEach(({ x, y, hp, maxHp }) => {
            let dx = this.playerX - x;
            let dy = this.playerY - y;
            let dist = Math.abs(dx) + Math.abs(dy);

            if (dist === 1) {
                let playerTile = this.map[this.playerY][this.playerX];
                playerTile.hp -= 1;
                if (playerTile.hp <= 0) {
                    alert("Вы проиграли!");
                    location.reload();
                }
                return;
            }

            let dir = null;
            if (dist <= visionRadius) {
                dir = Math.abs(dx) > Math.abs(dy)
                    ? { dx: dx > 0 ? 1 : -1, dy: 0 }
                    : { dx: 0, dy: dy > 0 ? 1 : -1 };
            } else {
                const dirs = [
                    { dx: 0, dy: -1 },
                    { dx: 0, dy: 1 },
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 0 }];
                dir = dirs[Math.floor(Math.random() * dirs.length)];
            }

            let newX = x + dir.dx;
            let newY = y + dir.dy;

            if (
                newX >= 0 && newX < this.width &&
                newY >= 0 && newY < this.height &&
                this.map[newY][newX].type === "" &&
                !(newX === this.playerX && newY === this.playerY)
            ) {
                this.map[newY][newX] = { type: "E", hp, maxHp };
                this.map[y][x] = { type: "" };
            }
        });
    }

    //Функция рендеренга персонажа
    this.generatePerson = function (){
        let placePers = 0

        while(placePers < 1) {
            let x = Math.floor(Math.random() * this.width)
            let y = Math.floor(Math.random() * this.height)

            let tile = this.map[y][x]
            if(tile.type === ''){
                if(placePers < 1){
                    tile.type = 'P'
                    tile.hp = 10
                    tile.maxHp = 10
                    placePers++
                    this.playerX = x
                    this.playerY = y

                }
            }
        }

    }

    // Функция передвижения перса
    this.movePlayer = function (dx, dy) {
        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        // Проверка выхода за границы карты
        if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) return

        const currentTile = this.map[this.playerY][this.playerX]
        const targetTile = this.map[newY][newX]

        // Игрок может двигаться только на пустую клетку, зелье или меч
        if (targetTile.type === '' || targetTile.type === 'HP' || targetTile.type === 'SW') {
            // Сохраняем текущие HP игрока
            let hp = currentTile.hp
            let maxHp = currentTile.maxHp

            // Обработка подбора меча
            if (targetTile.type === 'SW') {
                this.hasSword = true
                $('#sword-icon').show() // Показать иконку меча в инвентаре
                showMessage('Вы нашли меч!')
            }

            // Обработка подбора зелья
            if (targetTile.type === 'HP') {
                // Восстанавливаем здоровье, но не выше максимального
                hp = Math.min(maxHp, hp + 3)
                showMessage('Вы выпили зелье и восстановили здоровье!')
            }

            // Освобождаем текущую клетку
            currentTile.type = ''
            delete currentTile.hp
            delete currentTile.maxHp

            // Перемещаем игрока
            this.playerX = newX
            this.playerY = newY

            // Сохраняем игрока в новой клетке
            targetTile.type = 'P'
            targetTile.hp = hp
            targetTile.maxHp = maxHp

            this.render(); // Обновляем отрисовку карты
        }
    };

    // Функция атаки перса
    this.playerAttack = function () {
        let radius = this.hasSword ? 3 : 1

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {

                if (dx === 0 && dy === 0) continue

                let x = this.playerX + dx
                let y = this.playerY + dy

                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    let tile = this.map[y][x]

                    if (tile.type === 'E') {
                        tile.hp -= 3
                        if (tile.hp <= 0) {
                            this.map[y][x] = { type: '' }
                        }
                    }
                }
            }
        }

        // После первой атаки с мечом он ломается
        if (this.hasSword) {
            this.hasSword = false
            $('#sword-icon').hide() // Скрываем меч из инвентаря
            showMessage("Меч сломался после мощной атаки!")
        }

        this.checkWinCondition()
    };


    // Функция победы (вспомогательная)
    this.checkWinCondition = function () {
        let enemiesLeft = 0
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x].type === 'E') enemiesLeft++
            }
        }
        if (enemiesLeft === 0) {
            alert("Вы победили!")
            location.reload()
        }
    };

    // Функция рендеринга
    this.render = function () {
        let $field = $(".field") // получили div.field
        $field.empty() // Очистили

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tile = this.map[y][x]// выбрали клетку

                let $tile = $("<div>").addClass('tile').addClass('tile' + tile.type)

                // Добавляем полоску HP
                if (tile.hp !== undefined && tile.maxHp !== undefined) {
                    let healthWidth = Math.floor((tile.hp / tile.maxHp) * 25);
                    let $health = $("<div>").addClass("health").css({
                        width: healthWidth + "px"
                    });
                    $tile.append($health);
                }

                // Позиция клетки
                $tile.css({left: x * 25, top: y * 25})
                $field.append($tile) // Добавляем клетки в поле
            }
        }



    }

    function showMessage(text) {
        $('#message').stop(true, true).text(text).fadeIn(200).delay(1500).fadeOut(400);
    }
}


$(function (){
    // Запускаем
    let game=new Game();
    game.generateMap();
    game.generateRooms();
    game.generatePassages();
    game.generateItems()
    game.generateEnemies();
    game.generatePerson();
    game.render();


// Двигаем врагов каждые 500 мс
    setInterval(() => {
        game.moveEnemy();
        game.render();
    }, 500);

// Прослушка для WASD
    document.addEventListener("keydown", function(e) {
        console.log("Key pressed:", e.key);
        switch (e.key.toLowerCase()) {
            case 'w': case 'ц': game.movePlayer(0, -1); break;
            case 's': case 'ы': game.movePlayer(0, 1); break;
            case 'a': case 'ф': game.movePlayer(-1, 0); break;
            case 'd': case 'в': game.movePlayer(1, 0); break;
            case ' ': game.playerAttack(); game.render(); break;
        }

    });
})




