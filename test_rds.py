import pymysql
import sys

def test_connection():
    print("🐍 正在尝试使用 Python (pymysql) 连接 RDS...")
    try:
        connection = pymysql.connect(
            host='rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com',
            user='magicyang',
            password='Wysk1214',
            database='realsourcing',
            port=3306,
            connect_timeout=10,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ Python 连接成功！")
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 as success, NOW() as time")
            result = cursor.fetchone()
            print(f"📊 查询结果: {result}")
        connection.close()
    except Exception as e:
        print(f"❌ Python 连接失败: {e}")

if __name__ == "__main__":
    test_connection()
