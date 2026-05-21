'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/ToolLayout'
import { Upload, Download, RotateCcw } from 'lucide-react'

type Mode = 'watermark' | 'redact'
type RedactStyle = 'mosaic' | 'blur' | 'solid'
interface Rect { x: number; y: number; w: number; h: number }

const DEFAULTS = {
  text: '内部资料 禁止外传', fontSize: 28, color: '#5b5bd6', opacity: 25,
  rotation: -30, cols: 4, rows: 6, redactStyle: 'mosaic' as RedactStyle,
  mosaicSize: 12, blurStrength: 8, solidColor: '#000000',
}

export default function WatermarkPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [mode, setMode] = useState<Mode>('watermark')
  const [text, setText] = useState(DEFAULTS.text)
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize)
  const [color, setColor] = useState(DEFAULTS.color)
  const [opacity, setOpacity] = useState(DEFAULTS.opacity)
  const [rotation, setRotation] = useState(DEFAULTS.rotation)
  const [cols, setCols] = useState(DEFAULTS.cols)
  const [rows, setRows] = useState(DEFAULTS.rows)
  const [redactStyle, setRedactStyle] = useState<RedactStyle>(DEFAULTS.redactStyle)
  const [mosaicSize, setMosaicSize] = useState(DEFAULTS.mosaicSize)
  const [blurStrength, setBlurStrength] = useState(DEFAULTS.blurStrength)
  const [solidColor, setSolidColor] = useState(DEFAULTS.solidColor)
  const [rects, setRects] = useState<Rect[]>([])
  const [drawing, setDrawing] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  const loadImage = useCallback((file: File) => {
    const r = new FileReader()
    r.onload = e => { const i = new Image(); i.onload = () => { setImg(i); setRects([]) }; i.src = e.target?.result as string }
    r.readAsDataURL(file)
  }, [])

  const draw = useCallback(() => {
    const c = canvasRef.current
    if (!c || !img) return
    const ctx = c.getContext('2d')!
    c.width = img.width; c.height = img.height
    ctx.drawImage(img, 0, 0)

    if (mode === 'watermark' && text) {
      ctx.save()
      ctx.globalAlpha = opacity / 100
      ctx.fillStyle = color
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const stepX = img.width / cols
      const stepY = img.height / rows
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          ctx.save()
          ctx.translate(stepX * (cc + 0.5), stepY * (r + 0.5))
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
      ctx.restore()
    }

    if (mode === 'redact') {
      for (const rc of rects) {
        const w = Math.max(1, Math.round(rc.w)), h = Math.max(1, Math.round(rc.h))
        const x = Math.round(rc.x), y = Math.round(rc.y)
        if (redactStyle === 'solid') {
          ctx.fillStyle = solidColor
          ctx.fillRect(x, y, w, h)
        } else if (redactStyle === 'mosaic') {
          const block = Math.max(2, mosaicSize)
          for (let by = y; by < y + h; by += block) {
            for (let bx = x; bx < x + w; bx += block) {
              const px = ctx.getImageData(bx, by, 1, 1).data
              ctx.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`
              ctx.fillRect(bx, by, block, block)
            }
          }
        } else {
          const region = ctx.getImageData(x, y, w, h)
          const blurred = boxBlur(region, blurStrength)
          ctx.putImageData(blurred, x, y)
        }
      }
    }
  }, [img, mode, text, fontSize, color, opacity, rotation, cols, rows, rects, redactStyle, mosaicSize, blurStrength, solidColor])

  useEffect(() => { draw() }, [draw])

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (img!.width / rect.width),
      y: (e.clientY - rect.top) * (img!.height / rect.height),
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = canvasRef.current?.toDataURL('image/png') || ''
    a.download = 'processed.png'
    a.click()
  }
  const reset = () => {
    setText(DEFAULTS.text); setFontSize(DEFAULTS.fontSize); setColor(DEFAULTS.color)
    setOpacity(DEFAULTS.opacity); setRotation(DEFAULTS.rotation); setCols(DEFAULTS.cols); setRows(DEFAULTS.rows)
    setRedactStyle(DEFAULTS.redactStyle); setMosaicSize(DEFAULTS.mosaicSize); setBlurStrength(DEFAULTS.blurStrength)
    setSolidColor(DEFAULTS.solidColor); setRects([])
  }

  const num = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5bd6]/40'

  return (
    <ToolLayout title="PDF / 图片 水印与打码工具" description="文字水印平铺、马赛克/模糊/纯色打码，实时预览框选">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {([['watermark', '添加水印'], ['redact', '框选打码']] as [Mode, string][]).map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === m ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600'}`}>{l}</button>
            ))}
          </div>

          {mode === 'watermark' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div><label className="text-xs text-gray-500 block mb-1">水印文字</label>
                <input value={text} onChange={e => setText(e.target.value)} className={num}/></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500 block mb-1">字号</label>
                  <input type="number" min="8" value={fontSize} onChange={e => setFontSize(+e.target.value)} className={num}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">颜色</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-9 rounded border border-gray-200"/></div>
                <div><label className="text-xs text-gray-500 block mb-1">横向数量</label>
                  <input type="number" min="1" max="20" value={cols} onChange={e => setCols(+e.target.value)} className={num}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">纵向数量</label>
                  <input type="number" min="1" max="30" value={rows} onChange={e => setRows(+e.target.value)} className={num}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">透明度 {opacity}%</label>
                <input type="range" min="5" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full"/></div>
              <div><label className="text-xs text-gray-500 block mb-1">旋转角度 {rotation}°</label>
                <input type="range" min="-90" max="90" value={rotation} onChange={e => setRotation(+e.target.value)} className="w-full"/></div>
            </div>
          )}

          {mode === 'redact' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <p className="text-xs text-gray-500 bg-slate-50 rounded-lg p-2">在右侧图片上拖拽框选需要打码的区域</p>
              <div>
                <label className="text-xs text-gray-500 block mb-1">打码方式</label>
                <div className="flex gap-1.5">
                  {([['mosaic', '马赛克'], ['blur', '模糊'], ['solid', '纯色遮挡']] as [RedactStyle, string][]).map(([s, l]) => (
                    <button key={s} onClick={() => setRedactStyle(s)}
                      className={`flex-1 py-1.5 rounded text-xs font-medium ${redactStyle === s ? 'bg-[#5b5bd6] text-white' : 'bg-slate-100 text-gray-600'}`}>{l}</button>
                  ))}
                </div>
              </div>
              {redactStyle === 'mosaic' && (
                <div><label className="text-xs text-gray-500 block mb-1">马赛克块大小 {mosaicSize}px</label>
                  <input type="range" min="4" max="40" value={mosaicSize} onChange={e => setMosaicSize(+e.target.value)} className="w-full"/></div>
              )}
              {redactStyle === 'blur' && (
                <div><label className="text-xs text-gray-500 block mb-1">模糊强度 {blurStrength}</label>
                  <input type="range" min="2" max="20" value={blurStrength} onChange={e => setBlurStrength(+e.target.value)} className="w-full"/></div>
              )}
              {redactStyle === 'solid' && (
                <div><label className="text-xs text-gray-500 block mb-1">遮挡颜色</label>
                  <input type="color" value={solidColor} onChange={e => setSolidColor(e.target.value)} className="w-full h-9 rounded border border-gray-200"/></div>
              )}
              {rects.length > 0 && (
                <button onClick={() => setRects([])} className="text-xs text-red-500 hover:underline">清除全部打码（{rects.length}）</button>
              )}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#5b5bd6]/40"
            onClick={() => document.getElementById('wm-file')?.click()}>
            <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1"/>
            <p className="text-xs text-gray-500">上传图片</p>
            <input id="wm-file" type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadImage(f) }}/>
          </div>
          {img && (
            <div className="flex gap-2">
              <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                <Download className="h-4 w-4"/> 下载处理后图片
              </button>
              <button onClick={reset} className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 text-gray-600 rounded-lg text-sm hover:bg-slate-200">
                <RotateCcw className="h-4 w-4"/>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {img ? (
            <canvas ref={canvasRef} className="w-full border border-gray-200 rounded-xl cursor-crosshair"
              onMouseDown={e => { if (mode === 'redact') { setDrawing(true); setStart(getPos(e)) } }}
              onMouseMove={e => {
                if (drawing && mode === 'redact') {
                  const p = getPos(e); draw()
                  const ctx = canvasRef.current!.getContext('2d')!
                  ctx.strokeStyle = '#5b5bd6'; ctx.lineWidth = 2
                  ctx.strokeRect(start.x, start.y, p.x - start.x, p.y - start.y)
                }
              }}
              onMouseUp={e => {
                if (mode === 'redact' && drawing) {
                  const p = getPos(e)
                  const w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y)
                  if (w > 4 && h > 4) {
                    setRects(prev => [...prev, { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w, h }])
                  }
                  setDrawing(false)
                }
              }}/>
          ) : (
            <div className="bg-slate-100 rounded-xl h-72 flex items-center justify-center text-gray-400 text-sm">
              上传图片后在此预览，可实时调整水印 / 打码参数
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

function boxBlur(data: ImageData, radius: number): ImageData {
  const { width: w, height: h } = data
  const src = data.data
  const out = new Uint8ClampedArray(src)
  const r = Math.max(1, Math.min(radius, 20))
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let tr = 0, tg = 0, tb = 0, count = 0
      for (let dy = -r; dy <= r; dy += 2) {
        for (let dx = -r; dx <= r; dx += 2) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
          const idx = (ny * w + nx) * 4
          tr += src[idx]; tg += src[idx + 1]; tb += src[idx + 2]; count++
        }
      }
      const i = (y * w + x) * 4
      out[i] = tr / count; out[i + 1] = tg / count; out[i + 2] = tb / count
    }
  }
  return new ImageData(out, w, h)
}
