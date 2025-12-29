# SCRIPT: Apply Quote Generator Fix to Step6Results.tsx

$file = "c:\Users\Andy\Desktop\XYZ Plus\frontend\src\components\Wizard\Step6Results.tsx"
$content = Get-Content $file -Raw

# El código del FIX proporcionado por el usuario
$fixCode = @'
            {/* --- INICIO DEL FIX --- */}
            
            {/* 1. Panel de Configuración de Ventas (Protegido contra nulls) */}
            {results && (
                <div className="mb-8">
                    <SalesConfig 
                        costTotal={results.summary.totalEstimatedPrice || 0}
                        onConfigChange={setSalesConfig}
                    />
                </div>
            )}

            {/* 2. Botones de Acción */}
            <div className="flex flex-wrap gap-4 justify-end no-print mt-8">
                
                {/* Botón Etiquetas (Ya existía) */}
                <button
                    onClick={handlePrintLabels}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                    🏷️ Imprimir Etiquetas
                </button>

                {/* Botón Cotización (NUEVO - Sintaxis Corregida) */}
                <button
                    onClick={handleGenerateQuote}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                    📄 Generar Cotización
                </button>

                {/* Botón Reiniciar (Ya existía) */}
                <button
                    onClick={resetProject}
                    className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
                >
                    🔄 Nuevo Proyecto
                </button>
            </div>
            
            {/* --- FIN DEL FIX --- */}
'@

# Patrón para encontrar y reemplazar la sección problemática
# Busca desde "</div>" después de SalesConfig hasta antes del próximo bloque importante

# PATRÓN 1: Eliminar cualquier SalesConfig mal formateado existente
$badSalesConfig = '(?s)\s*\{/\* Sales Configuration Panel \*/\}.*?onConfigChange=\{setSalesConfig\}.*?/\>\s*'
$content = $content -replace $badSalesConfig, ''

# PATRÓN 2: Eliminar botones mal formateados
$badButtons = '(?s)</button>\s*<button\s+onClick={handleGenerateQuote}.*?</button>'
$content = $content -replace $badButtons, '</button>'

# PATRÓN 3: Buscar donde insertar el FIX (antes del "Selector de Pestañas" o tabs)
$insertPattern = '(\s*)(\{/\* Selector de Pestañas \*/\})'
$replacement = "`$1$fixCode`r`n`r`n`$1`$2"

$newContent = $content -replace $insertPattern, $replacement

# Guardar
Set-Content $file $newContent

Write-Host "✅ Fix aplicado correctamente a Step6Results.tsx"
'@

Set-Content "c:\Users\Andy\Desktop\XYZ Plus\apply_fix.ps1" $fixCode
Write-Host "Script created at: c:\Users\Andy\Desktop\XYZ Plus\apply_fix.ps1"
