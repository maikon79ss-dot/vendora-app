import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const data = await resend.emails.send({
      from: "Vendora <onboarding@resend.dev>",
      to: ["maikon79ss@gmail.com"],
      subject: "Vendora Test Email",
      html: `
        <h2>🎉 Поздравления!</h2>
        <p>Vendora вече изпраща имейли чрез Resend.</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}