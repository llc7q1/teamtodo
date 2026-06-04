import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        📋 TeamTodo
      </div>
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="搜索任务..."
          className={styles.searchInput}
        />
        <button className={styles.iconButton} title="通知">
          🔔
        </button>
        <div className={styles.avatar}>我</div>
      </div>
    </nav>
  );
}
