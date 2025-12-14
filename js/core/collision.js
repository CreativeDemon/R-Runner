// js/core/collision.js
window.Collision = {
  box(A, B) {
    if (!A || !B) return false;
    return (A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y);
  }
};