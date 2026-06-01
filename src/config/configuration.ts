export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DB_URL ?? 'postgres://todo:todo@localhost:5432/todo',
  },
});
