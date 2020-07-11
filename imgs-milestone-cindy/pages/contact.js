import React from "react";
import Head from "next/head";
import { isEmpty, isEmail } from "validator";
import { useRouter } from "next/router";
import config from "../config";

function Team() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    email: "",
    subject: "",
    description: ""
  });
  const handleChange = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };
  const handleSubmit = event => {
    if (
      isEmail(form.email) &&
      !isEmpty(form.subject) &&
      !isEmpty(form.description)
    ) {
      event.preventDefault();
      // console.log("email", form.email);
      // console.log("subject", form.subject);
      // console.log("description", form.description);
    }
  };

  const title = "Contact - VAVEL Images";
  const description = "Contact - VAVEL Images";
  const currenturl = `${config.HOST}${router.asPath}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link href={currenturl} rel="canonical" />
        <meta property="og:url" content={`${currenturl}`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <div className="contact-us">
        <h1>contact our team</h1>
        <h4>Submit your query to our Photography team</h4>
        <form>
          <h3>submit a request here!</h3>
          <div className="form-item">
            <label>your mail address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label>subject</label>
            <input
              type="text"
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label>description</label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <p>
            Please enter the details of your request. A member of our support
            staff will respond as soon as possible!
          </p>
          <button type="submit" value="submit" onClick={handleSubmit}>
            submit
          </button>
        </form>
      </div>
    </>
  );
}

export default Team;
