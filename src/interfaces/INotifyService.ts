export interface INotifyService {
  notify(userId: string, title: string, text: string): Promise<void>
}
