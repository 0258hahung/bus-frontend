<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>FUTA Bus Lines</h3>
        <p>Hệ thống đặt vé xe khách hàng đầu Việt Nam</p>
      </div>

      <div class="footer-section">
        <h4>Liên hệ</h4>
        <p>📞 Hotline: 1900 6067</p>
        <p>✉️ Email: support@futabus.vn</p>
        <p>🌐 Website: futabus.vn</p>
      </div>

      <div class="footer-section">
        <h4>Theo dõi chúng tôi</h4>
        <div class="social-links">
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">Instagram</a>
          <a href="#" class="social-link">YouTube</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 FUTA Bus Lines - Tất cả quyền được bảo lưu</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--gray-900);
  color: white;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-section h3 {
  color: var(--primary-color);
  margin-bottom: 16px;
  font-size: 24px;
}

.footer-section h4 {
  margin-bottom: 16px;
  font-size: 18px;
}

.footer-section p {
  color: var(--gray-400);
  margin-bottom: 8px;
}

.social-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.social-link {
  color: white;
  padding: 8px 16px;
  background: var(--gray-800);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid var(--gray-800);
  padding: 24px;
  text-align: center;
  color: var(--gray-500);
}
</style>