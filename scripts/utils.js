function bombSetPosition(point) {
  return Math.round(point / cellSize) * cellSize;
}

function checkTypeOfCell(cells, x, y) {
  return cells[Math.round(y / cellSize)][Math.round(x / cellSize)];
}