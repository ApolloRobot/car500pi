import { resolve } from 'path'
import Bundler from 'parcel-bundler'
import views from 'koa-views'
import serve from 'koa-static'

const r = path => resolve(__dirname, path)

// const bundler = new Bundler(r('../../../src/index.html'), {
//   publicUrl: '/',
//   watch: true
// })

export const dev = async app => {
  // await bundler.bundle()

  app.use(serve(r('../../../dist')))
  // app.use(serve(r('../../../static')))
  // app.use(views(r('../../../dist'), {
  //   extension: 'html'
  // }))

  // app.use(async (ctx) => {
  //   await ctx.render('index.html')
  // })
}
