import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';

export default class TestUsers1744707251495 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    const roles = await dataSource.query(`SELECT id, name FROM role`);
    const getRoleId = (name: string) => roles.find((r: any) => r.name === name)?.id;

    const users = [
      { email: 'super@gmail.com', first_name: 'SuperAdmin 0', role: 'SuperAdmin' },
      { email: 'super1@gmail.com', first_name: 'SuperAdmin 1', role: 'SuperAdmin' },
      { email: 'admin@gmail.com', first_name: 'Admin 0', role: 'Admin' },
      { email: 'faci@gmail.com', first_name: 'Facilitator 0', role: 'Facilitator' },
      { email: 'rev@gmail.com', first_name: 'Reviewer 0', role: 'Reviewer' },
      { email: 'rev2@gmail.com', first_name: 'Reviewer 1', role: 'Reviewer' },
      { email: 'cont@gmail.com', first_name: 'Contributor 0', role: 'Contributor' },
      { email: 'cont1@gmail.com', first_name: 'Contributor 1', role: 'Contributor' },
      { email: 'proj@gmail.com', first_name: 'ProjectManager 0', role: 'ProjectManager' },
      { email: 'proj1@gmail.com', first_name: 'ProjectManager 1', role: 'ProjectManager' },
      { email: 'admin1@gmail.com', first_name: 'Admin 1', role: 'Admin' },
      { email: 'faci1@gmail.com', first_name: 'Facilitator 1', role: 'Facilitator' },
    ];

    for (const u of users) {
      const exists = await dataSource.query(
        `SELECT id FROM "users" WHERE email = $1`, [u.email]
      );
      if (exists.length > 0) continue;

      const roleId = getRoleId(u.role);
      if (!roleId) throw new Error(`Role ${u.role} not found`);

      const result = await dataSource.query(
        `INSERT INTO "users" (first_name, middle_name, last_name, email, password, role_id, is_active, created_date, updated_date)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         RETURNING id`,
        [u.first_name, u.first_name, u.first_name, u.email, hashedPassword, roleId]
      );
      const userId = result[0].id;

      if (u.role === 'Contributor' || u.role === 'Reviewer') {
        await dataSource.query(
          `INSERT INTO task_distribution.user_score (user_id, score) VALUES ($1, 0) ON CONFLICT DO NOTHING`,
          [userId]
        );
        await dataSource.query(
          `INSERT INTO wallet (user_id, balance, created_date, updated_date)
           VALUES ($1, 0, NOW(), NOW()) ON CONFLICT DO NOTHING`,
          [userId]
        );
      }
    }
  }
}
