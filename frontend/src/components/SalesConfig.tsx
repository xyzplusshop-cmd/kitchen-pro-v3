import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp, Calculator } from 'lucide-react';

interface SalesConfigProps {
    costTotal: number;
    onConfigChange: (config: SalesConfiguration) => void;
}

export interface SalesConfiguration {
    profitMargin: number;
    taxRate: number;
    discount: number;
    discountType: '$' | '%';
    showPricePerModule: boolean;
}

export const SalesConfig: React.FC<SalesConfigProps> = ({ costTotal, onConfigChange }) => {
    const [profitMargin, setProfitMargin] = useState(40);
    const [taxRate, setTaxRate] = useState(18);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'$' | '%'>('%');
    const [showPricePerModule, setShowPricePerModule] = useState(false);

    // Calculate sale price in real-time
    const calculateSalePrice = (): { subtotal: number; afterDiscount: number; total: number; taxAmount: number } => {
        // Base price with margin
        const subtotal = costTotal / (1 - (profitMargin / 100));

        // Apply discount
        const discountAmount = discountType === '$' ? discount : subtotal * (discount / 100);
        const afterDiscount = subtotal - discountAmount;

        // Add tax
        const taxAmount = afterDiscount * (taxRate / 100);
        const total = afterDiscount + taxAmount;

        return { subtotal, afterDiscount, total, taxAmount };
    };

    const prices = calculateSalePrice();

    // Update parent when config changes
    React.useEffect(() => {
        onConfigChange({
            profitMargin,
            taxRate,
            discount,
            discountType,
            showPricePerModule,
        });
    }, [profitMargin, taxRate, discount, discountType, showPricePerModule]);

    return (
        <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-green-300 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 p-3 rounded-xl">
                    <DollarSign className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">💰 CONFIGURACIÓN DE VENTA</h3>
                    <p className="text-sm text-slate-500">Configura márgenes, impuestos y descuentos para generar cotización</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Profit Margin */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <TrendingUp size={16} className="text-green-600" />
                        Margen de Ganancia
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            value={profitMargin}
                            onChange={(e) => setProfitMargin(Number(e.target.value))}
                            className="flex-1 p-3 rounded-lg border-2 border-green-200 font-bold text-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <span className="text-2xl font-black text-green-600">%</span>
                    </div>
                    <div className="text-xs text-slate-500">Ganancia sobre el costo</div>
                </div>

                {/* Tax Rate */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Percent size={16} className="text-blue-600" />
                        Impuesto / IVA
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="50"
                            step="1"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="flex-1 p-3 rounded-lg border-2 border-blue-200 font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-2xl font-black text-blue-600">%</span>
                    </div>
                    <div className="text-xs text-slate-500">IVA o impuesto local</div>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Calculator size={16} className="text-purple-600" />
                        Descuento (Opcional)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="flex-1 p-3 rounded-lg border-2 border-purple-200 font-bold text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as '$' | '%')}
                            className="p-3 rounded-lg border-2 border-purple-200 font-bold text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="%">%</option>
                            <option value="$">$</option>
                        </select>
                    </div>
                    <div className="text-xs text-slate-500">Descuento aplicado</div>
                </div>
            </div>

            {/* Price Display Toggle */}
            <div className="mb-6 p-4 bg-white rounded-lg border-2 border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showPricePerModule}
                        onChange={(e) => setShowPricePerModule(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-slate-700">
                        Mostrar precio unitario por módulo en la cotización
                    </span>
                </label>
                <p className="text-xs text-slate-500 ml-8 mt-1">
                    {showPricePerModule
                        ? '✓ Los clientes verán el precio de cada módulo (más transparente)'
                        : '✓ Solo se mostrará el precio total del proyecto (más limpio)'}
                </p>
            </div>

            {/* Real-time Preview */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Costo Total (Interno)</div>
                        <div className="text-2xl font-black text-slate-400">${costTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Precio de Venta (Cliente)</div>
                        <div className="text-4xl font-black text-green-600">${prices.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-slate-500">Subtotal:</div>
                        <div className="font-bold">${prices.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    {discount > 0 && (
                        <div>
                            <div className="text-slate-500">Descuento:</div>
                            <div className="font-bold text-red-600">-${(prices.subtotal - prices.afterDiscount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                    )}
                    <div>
                        <div className="text-slate-500">Impuesto:</div>
                        <div className="font-bold">+${prices.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
