import views from 'koa-views'
import serve from 'koa-static'
import { resolve } from 'path'
const r = path => resolve(__dirname, path)

export const prod = app => {
  app.use(serve(r('../../../dist')))
  // app.use(serve(r('../../../static')))
  // app.use(views(r('../../../dist'), {
  //   extension: 'html'
  // }))

  // app.use(async (ctx) => {
  //   await ctx.render('index.html')
  // })
}
