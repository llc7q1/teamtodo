import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>T</span>
        TeamTodo
      </div>
      <div className={styles.actions}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            placeholder="搜索任务..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.iconButton} title="通知">
          &#128276;
        </button>
        <div className={styles.avatar}>我</div>
      </div>
    </nav>
  );
}
