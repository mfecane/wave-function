import gulp from 'gulp'
import plumber from 'gulp-plumber'
import gbr from 'gulp-better-rollup'
import typescript from '@rollup/plugin-typescript'
import sourcemaps from 'gulp-sourcemaps'

const { src, dest } = gulp

export default (dirs) => {
  const js = async () => {
    return src(dirs.js.src)
      .pipe(
        plumber({
          handleError: function (err) {
            console.log(err)
            this.emit('end')
          },
        })
      )
      .pipe(sourcemaps.init())
      .pipe(
        gbr(
          {
            plugins: [
              typescript({
                tsconfig: 'tsconfig.json',
              }),
            ],
          },
          {
            format: 'cjs',
            file: 'bundle.js',
          }
        )
      )
      .pipe(sourcemaps.write())
      .pipe(dest(dirs.js.dest))
  }
  return js
}
