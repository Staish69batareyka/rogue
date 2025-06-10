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
        let roomCount = 5
        for ( let i = 0; i < roomCount; i++ ) {
            let w = 3
            let h = 5
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
game.render();
