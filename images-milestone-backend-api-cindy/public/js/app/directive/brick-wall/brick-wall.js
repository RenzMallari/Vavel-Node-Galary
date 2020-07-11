angular.module('photographer').directive('brickWall', function(configService, $compile) {
  return {
    restrict: 'E',
    scope: {
      bricks: '='
    },
    compile(element, attr) {
      const brickHtml = element.html();

      return function(scope, element, attrs) {
        let lastWidth = 0;
        let rowWidth = 0;
        const margin = parseInt(attrs['margin']) || 5;
        const rowHeight = parseInt(attrs['rowHeight']) || 155;
        const item = attrs['item'] || 'item';
        scope.rows = [];
        scope.$watch('bricks', function(nv) {
          if (nv) refresh();
        });

        function refresh() {
          rowWidth = element.parent().width();
          if (!rowWidth) return;

          buildWall(scope.bricks);
          if (rowWidth !== lastWidth) lastWidth = rowWidth;
        }

        window.onresize = function() {
          refresh();
          scope.$apply();
        };

        class Row {
          constructor(width, height, margin, maxByRow) {
            this.bricks = [];
            this.partialWidth = 0;
            this.margin = margin || 10;
            this.width = width - this.margin;
            this.height = height;
            this.maxByRow = maxByRow || 6;
            this.elem = angular.element(`<div style="overflow:hidden; height:${this.height}px; margin-top: ${this.margin}px; "></div>`);
          }

          addBrick(brick) {
            this.partialWidth = this.partialWidth + this.margin + brick.width;
            this.bricks.push(brick);
          }

          getGap() {
            return this.width - this.partialWidth;
          }

          fit(brick) {
            if (!this.bricks.length) {
              this.needResize = false;
              return true;
            }
            if (this.bricks.length == this.maxByRow) {
              this.needResize = true;
              return false;
            }
            if ((this.partialWidth + this.margin + brick.width) <= (this.width)) {
              this.needResize = false;
              return true;
            }
            else if ((brick.width / 2) <= this.getGap()) {
              this.needResize = true;
              return true;
            }
            else {
              this.needResize = true;
              return false;
            }
          }

          resize(last) {
            let remainingWidth = this.getGap();
            if (!this.needResize && last)
              remainingWidth = 0;
            const widthAdded = Math.floor(remainingWidth / (this.bricks.length));
            for (let i = 0; i < this.bricks.length; i++) {
              const brick = this.bricks[i];
              brick.leftMargin = this.margin < 0 ? 0 : this.margin;
              const ratio = widthAdded / brick.width;
              const brickContainerWidth = brick.width + widthAdded;
              brick.widthAdded = widthAdded;
              brick.ratio = ratio;
              brick.container = {
                width: brickContainerWidth,
                height: this.height
              };
              if (widthAdded > 0) {
                brick.width = brickContainerWidth;
                brick.height = Math.floor(brick.height * (1 + ratio));
              }
              const brickContainerElem = angular.element(`<div style="overflow: hidden; float:left; position:relative; height:${this.height}px; width: ${brickContainerWidth}px; margin-left: ${brick.leftMargin}px;"></div>`);
              const newScope = scope.$new(true);
              newScope[item] = brick;
              brickContainerElem.append($compile(brickHtml)(newScope));
              this.elem.append(brickContainerElem);
            }
          }
        }

        function initBrick(brick, maxHeight) {
          brick.width = brick.width || 200;
          brick.height = brick.height || 200;
          brick.originalWidth = brick.originalWidth || brick.width;
          brick.originalHeight = brick.originalHeight || brick.height;
          brick.width = Math.floor(brick.originalWidth / (brick.originalHeight / maxHeight));
          brick.height = maxHeight;
        }

        function buildWall(bricks, maxByRow) {
          const rows = scope.rows;
          rows.length = 0;
          element.empty();
          let currentRow = 0;
          rows.push(new Row(rowWidth, rowHeight, margin, maxByRow));

          bricks.forEach(function(brick) {
            initBrick(brick, rowHeight);
            if (rows[currentRow].fit(brick)) rows[currentRow].addBrick(brick);
            else {
              rows[currentRow].resize();
              currentRow++;
              rows.push(new Row(rowWidth, rowHeight, margin, maxByRow));
              rows[currentRow].addBrick(brick);
            }
          });
          rows[currentRow].resize(true);
          rows.forEach(function(row) {
            element.append(row.elem);
          });
          element.append(`<div style="height: ${margin * 2}px;"><div>`);
        }
      };
    }
  };
});
