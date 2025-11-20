import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TimeBankTransaction = {
  id: number;
  userId: number;
  amount: number;
  transactionType: 'credit' | 'debit' | 'adjustment';
  description: string;
  createdAt: string;
  createdBy: number | null;
};

type TimeBankBalance = {
  userId: number;
  balance: number;
  lastUpdated: string | null;
};

function formatHours(hours: number): string {
  const totalMinutes = Math.abs(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  const sign = hours < 0 ? '-' : '';
  return m > 0 ? `${sign}${h}h ${m}min` : `${sign}${h}h`;
}

export default function TimeBank() {
  const { user } = useAuth();

  const { data: balance, isLoading: balanceLoading } = useQuery<TimeBankBalance>({
    queryKey: ["/api/my-time-bank"],
    enabled: !!user,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<TimeBankTransaction[]>({
    queryKey: ["/api/my-time-bank-transactions"],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Banco de Horas" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Banco de Horas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Acompanhe seu saldo e histórico de banco de horas
              </p>
            </div>

            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] text-white">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl">Saldo Atual</CardTitle>
                    <CardDescription className="text-gray-100">
                      Seu saldo disponível no banco de horas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {balanceLoading ? (
                  <div className="h-20 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Carregando...</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        {formatHours(balance?.balance || 0)}
                      </div>
                      {balance?.lastUpdated && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Última atualização:{" "}
                          {format(new Date(balance.lastUpdated), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    {(balance?.balance || 0) > 0 ? (
                      <TrendingUp className="h-16 w-16 text-green-500" />
                    ) : (balance?.balance || 0) < 0 ? (
                      <TrendingDown className="h-16 w-16 text-red-500" />
                    ) : (
                      <Clock className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  Todas as movimentações do seu banco de horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Carregando histórico...</div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação registrada ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Horas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {transaction.transactionType === 'credit' && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  Crédito
                                </Badge>
                              )}
                              {transaction.transactionType === 'debit' && (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                                  Débito
                                </Badge>
                              )}
                              {transaction.transactionType === 'adjustment' && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                  Ajuste
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-md">
                              {transaction.description}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${
                              transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 
                              transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {transaction.amount > 0 && '+'}
                              {formatHours(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
