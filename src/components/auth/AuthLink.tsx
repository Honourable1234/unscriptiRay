import { Link } from '@/libs/I18nNavigation';

export const AuthLink = (props: {
  text: string;
  linkText: string;
  href: string;
}) => {
  return (
    <p className="p-3 text-center text-xs font-medium">
      <span className="text-white">{props.text}</span>
      {' '}
      <Link href={props.href} className="text-primary-100">
        {props.linkText}
      </Link>
    </p>
  );
};
