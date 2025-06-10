function Game() {
    this.width = 40;
    this.height = 25;
    this.map = []; // Инфа о каждой клетке

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
game.render();
