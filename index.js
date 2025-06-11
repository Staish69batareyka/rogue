function Game() {
    this.width = 40;
    this.height = 24;
    this.map = []; // Инфа о каждой клетке
    this.playerX = null;
    this.playerY = null;

    // Функция генерации карты (заполнение пространства стенами по ширине и высоте)
    this.generateMap = function () {
        for( let y = 0; y < this.height; y++ ){
            this.map[y] = []
            for( let x = 0; x < this.width; x++ ){
                this.map[y][x] = {type: "W"}
            }
        }
    }

    // Функция генерации комнат
    this.generateRooms = function () {

        let roomCount = 5 + Math.floor(Math.random() * 6) // Количество комнат

        let tries = 0 // Счетчик попыток генерации комнат
        // (чтобы не пересекались, и чтобы ограничить кол-во неуд. попыток)

        for ( let i = 0; i < roomCount && tries < 1000; tries++ ) {

            let w = 3 + Math.floor(Math.random() * 6) // Случайная ширина
            let h = 3 + Math.floor(Math.random() * 6) // Случайная высота

            let lx = Math.floor(Math.random() * (this.width - w - 1)) // Случайная координата (верх.лев.угол)
            let ly = Math.floor(Math.random() * (this.height - h - 1)) // Случайная координата (верх.лев.угол)

            // Проверка наложения комнат друг на друга
            if (this.isAreaEmpty(lx, ly, w, h)) {
                for ( let y = 0; y < h; y++ ) {
                    for(let x = 0; x < w; x++){
                        this.map[ly+y][lx+x].type = ''
                    }
                }
            }

            i++

        }
    }


    // Функция проверки области
    this.isAreaEmpty = function (x, y, w, h){

        //Проходимся по всей области комнаты и по периметру,
        // чтобы максимальное приближение комнат было на 1 кл друг от друга ([dy, dx] = -1).
        for ( let dy = -1; dy <= h; dy++ ) {
            for ( let dx = -1; dx <= w; dx++ ) {
                let rx = x + dx // координата, которую проверяем
                let ry = y + dy // координата, которую проверяем

                // Если клетка выходит за границы
                if ( ry < 0 || ry > this.height || rx < 0 || rx > this.width ){
                    continue
                }

                // Если клетка занята клеткой комнаты
                if (this.map[ry][rx].type === ""){
                    return false
                }
            }
        }
        return true
    }

    // Функция для генерации проходов
    this.generatePassages = function (){
        let vertic = 3 + Math.floor( Math.random() * 2 )
        let horis = 3 + Math.floor( Math.random() * 2 )

        // вертекальные проходы
        for (let i = 0; i < vertic; i++){
            let x = Math.floor(Math.random() * this.width)
            for (let y = 0; y < this.height; y++) {
                this.map[y][x].type = ""
            }
        }

        // горизонтальные проходы
        for (let i = 0; i < horis; i++){
            let y = Math.floor(Math.random() * this.height)
            for (let x = 0; x < this.width; x++) {
                this.map[y][x].type = ""
            }
        }
    }

    // Функция генерации зелий и мечей
    this.generateItems = function (){

        let placeHP = 0
        let placeSW = 0

        while(placeHP < 10 || placeSW < 2){

            let x = Math.floor(Math.random() * this.width)
            let y = Math.floor(Math.random() * this.height)

            let tile = this.map[y][x]

            // Размещаем в пустых местах
            if (tile.type === '') {
                if (placeHP < 10){
                    tile.type = "HP"
                    placeHP++
                } else if (placeSW < 2){
                    tile.type = "SW"
                    placeSW++
                }
            }

        }

    }

    // Функция генерации врагов
    this.generateEnemies = function (){
        let placeEnemy = 0

        while(placeEnemy < 10){

            let x = Math.floor(Math.random() * this.width)
            let y = Math.floor(Math.random() * this.height)

            let tile = this.map[y][x]

            if(tile.type === ''){
                if(placeEnemy < 10){
                    tile.type = 'E'
                    placeEnemy ++
                }
            }
        }




    }

    // Функция для передвижения врагов
    this.moveEnemy = function (){
        const visionRadius = 5

        for (let y = 0; y < this.height; y++){
            for (let x = 0; x < this.width; x++){
                let tile = this.map[y][x]

                if(tile.type === 'E'){
                    let dx = this.playerX - x
                    let dy = this.playerY - y

                    let dist = Math.abs(dx) + Math.abs(dy)
                    let dir = null

                    // Преследование героя
                    if (dist <= visionRadius){
                        if (Math.abs(dx) > Math.abs(dy)){
                            dir = {
                                dx: dx > 0 ? 1 : -1,
                                dy: 0
                            }
                        } else {
                            dir = {
                                dx: 0,
                                dy: dy > 0 ? 1 : -1
                            }
                        }
                    } else { // Случайное движение
                        let dirs = [
                            {dx: 0, dy: -1}, // вверх
                            {dx: 0, dy: 1}, // вниз
                            {dx: -1, dy: 0}, // влево
                            {dx: 1, dy: 0}, // вправо
                        ]
                        dir = dirs[Math.floor(Math.random() * dirs.length)]
                    }
                    let newX = x + dir.dx
                    let newY = y + dir.dy

                    // Проверка границ и свободной клетки
                    if (
                        newX >= 0 && newX < this.width &&
                        newY >= 0 && newY < this.height &&
                        this.map[newY][newX].type === ""
                    ) {
                        this.map[newY][newX].type = "E";
                        this.map[y][x].type = "";
                    }

                }
            }

        }
    }

    // Функция генерации героя
    this.generatePerson = function (){

        let placePers = 0



        while(placePers < 1) {
            let x = Math.floor(Math.random() * this.width)
            let y = Math.floor(Math.random() * this.height)

            let tile = this.map[y][x]
            if(tile.type === ''){
                if(placePers < 1){
                    tile.type = 'P'
                    placePers++
                    this.playerX = x
                    this.playerY = y
                }
            }
        }

    }

    // Функция передвижения перса
    this.movePlayer = function(dx, dy) {
        let newX = this.playerX + dx;
        let newY = this.playerY + dy;

        // Проверка границ поля
        if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) {
            return;
        }

        let targetTile = this.map[newY][newX];

        // Можно двигаться только по пустым клеткам или с предметами
        if (targetTile.type === '' || targetTile.type === 'HP' || targetTile.type === 'SW') {
            // Убираем игрока с текущей позиции
            this.map[this.playerY][this.playerX].type = '';

            // Ставим игрока на новое место
            this.playerX = newX;
            this.playerY = newY;
            targetTile.type = 'P';

            // (опционально) Можно обработать подбор предметов тут
            // например: if (targetTile.type === 'HP') { здоровье += ... }

            this.render(); // обновляем поле
        }
    }


    // Функция рендеринга
    this.render = function (){
        let $field = $(".field") // получили div.field
        $field.empty() // Очистили

        for( let y = 0; y < this.height; y++ ){
            for( let x = 0; x < this.width; x++ ){
                let tile = this.map[y][x]// выбрали клетку

                let $tile = $("<div>").addClass('tile').addClass('tile' + tile.type)

                // Позиция клетки
                $tile.css({
                    left: x*25,
                    top: y*25
                })
                $field.append($tile) // Добавляем клетки в поле
            }
        }
    }
}


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

document.addEventListener("keydown", function(e) {
    switch (e.key.toLowerCase()) {
        case 'w': game.movePlayer(0, -1); break;
        case 's': game.movePlayer(0, 1); break;
        case 'a': game.movePlayer(-1, 0); break;
        case 'd': game.movePlayer(1, 0); break;
    }
});
