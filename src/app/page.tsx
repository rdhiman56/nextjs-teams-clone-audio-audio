import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/transcribe/record');
}