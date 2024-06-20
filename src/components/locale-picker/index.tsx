import { Dropdown } from 'antd';

import useLocale, { LANGUAGE_MAP } from '@/locales/useLocale';

import { IconButton, SvgIcon } from '../icon';

import { LocalEnum } from '#/enum';
import type { MenuProps } from 'antd';

type Locale = keyof typeof LocalEnum;

/**
 * Locale Picker
 */
export default function LocalePicker() {
  const { setLocale, locale } = useLocale();

  const localeList: MenuProps['items'] = Object.values(LANGUAGE_MAP).map((item) => {
    return {
      key: item.locale,
      label: item.label,
      // icon:  <SvgIcon icon={item.icon} size="20" className="rounded-md" />,
    };
  });

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      key={locale}
      menu={{ items: localeList, onClick: (e) => setLocale(e.key as Locale) }}
    >
      <IconButton className="h-10 w-10 hover:scale-105">
        {locale === 'en_US' ? (
          <SvgIcon icon={`ic-locale_${locale}`} size="24" className="rounded-md" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 36 36">
            <path fill="#138808" d="M0 27a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4v-5H0z" />
            <path fill="#f93" d="M36 14V9a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v5z" />
            <path fill="#f7f7f7" d="M0 13.667h36v8.667H0z" />
            <circle cx="18" cy="18" r="4" fill="#000080" />
            <circle cx="18" cy="18" r="3.375" fill="#f7f7f7" />
            <path
              fill="#6666b3"
              d="m18.1 16.75l-.1.65l-.1-.65l.1-1.95zm-.928-1.841l.408 1.909l.265.602l-.072-.653zm-.772.32l.888 1.738l.412.513l-.238-.613zm-.663.508l1.308 1.45l.531.389l-.389-.531zm-.508.663l1.638 1.062l.613.238l-.513-.412zm-.32.772l1.858.601l.653.072l-.602-.265zM14.8 18l1.95.1l.65-.1l-.65-.1zm.109.828l1.909-.408l.602-.265l-.653.072zm.32.772l1.738-.888l.513-.412l-.613.238zm.508.663l1.45-1.308l.389-.531l-.531.389zm.663.508l1.062-1.638l.238-.613l-.412.513zm.772.32l.601-1.858l.072-.653l-.265.602zM18 21.2l.1-1.95l-.1-.65l-.1.65zm.828-.109l-.408-1.909l-.265-.602l.072.653zm.772-.32l-.888-1.738l-.412-.513l.238.613zm.663-.508l-1.308-1.45l-.531-.389l.389.531zm.508-.663l-1.638-1.062l-.613-.238l.513.412zm.32-.772l-1.858-.601l-.653-.072l.602.265zM21.2 18l-1.95-.1l-.65.1l.65.1zm-.109-.828l-1.909.408l-.602.265l.653-.072zm-.32-.772l-1.738.888l-.513.412l.613-.238zm-.508-.663l-1.45 1.308l-.389.531l.531-.389zm-.663-.508l-1.062 1.638l-.238.613l.412-.513zm-.772-.32l-.601 1.858l-.072.653l.265-.602z"
            />
            <g fill="#000080">
              <circle cx="17.56" cy="14.659" r=".2" />
              <circle cx="16.71" cy="14.887" r=".2" />
              <circle cx="15.948" cy="15.326" r=".2" />
              <circle cx="15.326" cy="15.948" r=".2" />
              <circle cx="14.887" cy="16.71" r=".2" />
              <circle cx="14.659" cy="17.56" r=".2" />
              <circle cx="14.659" cy="18.44" r=".2" />
              <circle cx="14.887" cy="19.29" r=".2" />
              <circle cx="15.326" cy="20.052" r=".2" />
              <circle cx="15.948" cy="20.674" r=".2" />
              <circle cx="16.71" cy="21.113" r=".2" />
              <circle cx="17.56" cy="21.341" r=".2" />
              <circle cx="18.44" cy="21.341" r=".2" />
              <circle cx="19.29" cy="21.113" r=".2" />
              <circle cx="20.052" cy="20.674" r=".2" />
              <circle cx="20.674" cy="20.052" r=".2" />
              <circle cx="21.113" cy="19.29" r=".2" />
              <circle cx="21.341" cy="18.44" r=".2" />
              <circle cx="21.341" cy="17.56" r=".2" />
              <circle cx="21.113" cy="16.71" r=".2" />
              <circle cx="20.674" cy="15.948" r=".2" />
              <circle cx="20.052" cy="15.326" r=".2" />
              <circle cx="19.29" cy="14.887" r=".2" />
              <circle cx="18.44" cy="14.659" r=".2" />
              <circle cx="18" cy="18" r=".9" />
            </g>
          </svg>
        )}
      </IconButton>
    </Dropdown>
  );
}
