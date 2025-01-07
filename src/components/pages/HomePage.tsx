import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCodeIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme } from '../../theme';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  title,
  description,
  to,
  color,
}) => (
  <Link to={to}>
    <Card
      variant="elevated"
      className="h-full p-6 hover:translate-y-[-4px] transition-all duration-200"
    >
      <div className="flex items-start">
        <div
          className={`p-3 rounded-lg ${color} text-white`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon }) => (
  <Card variant="default" className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {trend !== undefined && (
          <div className="mt-1 flex items-center text-sm">
            <ArrowTrendingUpIcon
              className={`w-4 h-4 mr-1 ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            />
            <span
              className={
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div className="p-3 bg-primary-100 rounded-lg">
        {icon}
      </div>
    </div>
  </Card>
);

export const HomePage: React.FC = () => {
  const quickActions = [
    {
      icon: <QrCodeIcon className="w-6 h-6" />,
      title: 'Escanear Producto',
      description: 'Escanea códigos de barras para registrar o consultar productos',
      to: '/scanner',
      color: 'bg-blue-500',
    },
    {
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
      title: 'Gestionar Inventario',
      description: 'Administra el inventario, movimientos y reportes',
      to: '/inventory',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido al Centro de Acopio!
        </h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu inventario de manera eficiente y mantén el control de tus productos.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Productos"
          value="1,234"
          trend={12}
          icon={<ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />}
        />
        <StatCard
          title="Movimientos Hoy"
          value="156"
          trend={-5}
          icon={<ChartBarIcon className="w-6 h-6 text-primary-600" />}
        />
        <StatCard
          title="Productos Bajos"
          value="8"
          icon={<ArrowTrendingUpIcon className="w-6 h-6 text-primary-600" />}
        />
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Actividad Reciente
          </h2>
          <Button
            variant="outline"
            size="sm"
          >
            Ver todo
          </Button>
        </div>
        <Card variant="default" className="overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Entrada de Producto
                    </p>
                    <p className="text-sm text-gray-500">
                      Se agregaron 50 unidades de Producto XYZ
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    Hace 2 horas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};
